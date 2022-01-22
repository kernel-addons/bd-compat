import fs from "./api/fs.js";
import path from "./api/path.js";
import DataStore from "./datastore.js";
import Logger from "./logger.js";
import SettingsManager from "./settingsmanager";
import Toasts from "./toasts.js";
import Utilities from "./utilities.js";

export default class PluginsManager {
    static listeners = {};
    static folder = DataStore.pluginsFolder;
    static extension = ".plugin.js";
    static addons = []; 
    static times = {};

    static on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = new Set();

        return this.listeners[event].add(callback), this.off.bind(this, event, callback);
    }

    static off(event, callback) {
        if (!this.listeners[event]) return;

        return this.listeners[event].delete(callback);
    }

    static dispatch(event, ...args) {
        if (!this.listeners[event]) return;

        for (const listener of this.listeners[event]) {
            try {listener(...args);}
            catch (error) {Logger.error("Emitter", error);}
        }
    }

    static initialize() {
        this.addonState = DataStore.getAddonState("plugins");

        this.observer = new MutationObserver((changes) => {
            for (const change of changes) this.onMutate(change);
        });

        this.observer.observe(document, {childList: true, subtree: true});

        BDCompatNative.IPC.on("navigate", () => this.onSwitch());

        Logger.log("PluginsManager", "Loading plugins...");
        this.loadAllPlugins();
        this.watchAddons();
    }

    static watchAddons() {
        this.watcher = fs.watch(this.folder, {persistent: false}, (eventType, filename) => {
            if (!eventType || !filename) return;
            const absolutePath = path.resolve(this.folder, filename);
            if (!filename.endsWith(this.extension)) return;
            
            // await new Promise(r => setTimeout(r, 100));
            try {
                const stats = fs.statSync(absolutePath);
                if (!stats.isFile() || !stats.mtime) return;
                if (this.times[filename] === stats.mtime.getTime()) return;
                this.times[filename] = stats.mtime.getTime();

                if (eventType === "rename") this.loadAddon(absolutePath, true);
                if (eventType === "change") this.reloadAddon(absolutePath, true);
            }
            catch (err) {
                if (fs.existsSync(absolutePath)) return;
                this.unloadAddon(absolutePath, true);
            }
        });
    }

    static loadAllPlugins() {
        for (const filename of fs.readdirSync(this.folder, "utf8")) {
            const location = path.resolve(this.folder, filename);
            const stats = fs.statSync(location);
            if (!filename.endsWith(this.extension) || !stats.isFile()) continue;
            this.times[filename] = stats.mtime.getTime();

            try {
                this.loadAddon(location, false);
                this.dispatch("updated");
            } catch (error) {
                Logger.error("PluginsManager", `Failed to load plugin ${filename}:`, error);
            }
        }
    }

    static compile(filecontent, name, location) {
        return `(function (module, exports, __dirname, __filename, global) {\n${filecontent}\nif (module.exports["${name}"]) {module.exports = module.exports["${name}"];}\nif (!module.exports || !module.exports.prototype) {module.exports = eval(${JSON.stringify(name)});}\n})\n//# sourceURL=${_.escape(location)}`;
    }

    static resolve(idOrFileOrAddon) {
        return this.addons.find(addon => addon.name === idOrFileOrAddon || addon.path === idOrFileOrAddon || addon === idOrFileOrAddon);
    }

    static loadAddon(location, showToast = true, showStart = true) {
        const filecontent = fs.readFileSync(location, "utf8");
        const meta = Utilities.parseMETA(filecontent);
        Object.assign(meta, {
            filename: path.basename(location),
            path: location,
            filecontent
        });

        if (this.resolve(meta.name) || this.resolve(meta.filename)) throw new Error(`There's already a plugin with name ${meta.name || meta.filename}!`);

        let module = {exports: {}};
        try {window.eval(this.compile(filecontent, meta.name, location))(module, module.exports, path.dirname(location), location, window);}
        catch (error) {
            Logger.error("PluginsManager", `Failed to compile ${meta.name || path.basename(location)}:`, error);
        }
        
        meta.exports = module.exports.toString().split(" ")[0] === "class"
            ? module.exports
            : module.exports?.__esModule
                ? (module.exports.default || module.exports.exports.default)
                : module.exports.exports;

        if (typeof meta.exports !== "function") throw "Plugin had no exports.";
        
        try {
            const instance = new meta.exports(meta);
            meta.instance = instance;
            if (typeof (instance.load) === "function") {
                try {
                    instance.load(meta);
                    Logger.log("PluginsManager", `${meta.name} was loaded!`);
                    if (showToast && SettingsManager.isEnabled("showToastsPluginLoad")) Toasts.show(`${meta.name} was loaded!`, {type: "success"});
                } catch (error) {
                    Logger.error("PluginsManager", `Unable to fire load() for ${meta.name || meta.filename}:`, error);
                }
            }
            if (!meta.version && typeof (instance.getVersion) === "function") meta.version = instance.getVersion(); 
            if (!meta.description && typeof (instance.getDescription) === "function") meta.description = instance.getDescription(); 
            if (!meta.author && typeof (instance.getAuthor) === "function") meta.author = `${instance.getAuthor()}`; // Prevent clever escaping. 

            if (!(meta.name in this.addonState)) {
                this.addonState[meta.name] = false;
                DataStore.saveAddonState("plugins", this.addonState);
            }
            this.addons.push(meta);

            if (this.addonState[meta.name]) this.startPlugin(meta, showStart);
        } catch (error) {
            Logger.error("PluginsManager", `Unable to load ${meta.name || meta.filename}:`, error);
        }

        if (meta.instance) return meta;
    }

    static unloadAddon(idOrFileOrAddon, showToast = true) {
        const addon = this.resolve(idOrFileOrAddon);
        if (!addon) return;

        this.stopPlugin(addon, false);
        this.addons.splice(this.addons.indexOf(addon), 1);
        if (showToast) {
            Logger.log("PluginsManager", `${addon.name} was unloaded!`);
            if (SettingsManager.isEnabled("showToastsPluginLoad")) Toasts.show(`${addon.name} was unloaded!`, {type: "info"});
        }
        this.dispatch("updated");
    }

    static startPlugin(plugin, showToast = true) {
        const addon = this.resolve(plugin);
        if (!addon) return;

        try {
            if (typeof(addon.instance.start) === "function") addon.instance.start();
            if (showToast) {
                Logger.log("PluginsManager", `${addon.name} has been started!`);
                if (SettingsManager.isEnabled("showToastsPluginStartStop")) Toasts.show(`${addon.name} has been started!`, {type: "info"});
            }
        } catch (error) {
            Logger.error("PluginsManager", `Unable to fire start() for ${addon.name}:`, error);
            Toasts.show(`${addon.name} could not be started!`, {type: "error"});
            return false;
        }

        return true;
    }

    static stopPlugin(plugin, showToast = true) {
        const addon = this.resolve(plugin);
        if (!addon) return;

        try {
            if (typeof (addon.instance.stop) === "function") addon.instance.stop();
            if (showToast) {
                Logger.log("PluginsManager", `${addon.name} has been stopped!`);
                if (SettingsManager.isEnabled("showToastsPluginStartStop")) Toasts.show(`${addon.name} has been stopped!`, {type: "info"});
            }
        } catch (error) {
            Logger.error("PluginsManager", `Unable to fire stop() for ${addon.name}:`, error);
            Toasts.show(`${addon.name} could not be stopped!`, {type: "error"});
            return false;
        }

        return true;
    }

    static isEnabled(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);
        if (!addon) return;

        return this.addonState[addon.name] ?? false;
    }

    static enableAddon(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);
        if (!addon) return Logger.warn("PluginsManager", `Unable to enable plugin that isn't loaded!`);

        if (this.isEnabled(addon)) return Logger.warn("PluginsManager", `Cannot enable addon twice!`);

        const success = this.startPlugin(addon, false);
        if (success) {
            Logger.log("PluginsManager", `${addon.name} has been enabled!`);
            if (SettingsManager.isEnabled("showToastsPluginState")) Toasts.show(`${addon.name} has been enabled!`, {type: "info"});
        }

        this.addonState[addon.name] = success;
        DataStore.saveAddonState("plugins", this.addonState);
        this.dispatch("toggled", addon.name, success);
    }

    static disableAddon(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);
        if (!addon) return Logger.warn("PluginsManager", `Unable to disable non-loaded addon!`);

        if (!this.isEnabled(addon)) return Logger.warn("PluginsManager", `Cannot disable addon twice!`);
        
        const success = this.stopPlugin(addon, false);
        if (success) {
            Logger.log("PluginsManager", `${addon.name} has been stopped!`);
            if (SettingsManager.isEnabled("showToastsPluginState")) Toasts.show(`${addon.name} has been stopped!`, {type: "info"});
        }
        
        this.addonState[addon.name] = false;
        DataStore.saveAddonState("plugins", this.addonState);
        this.dispatch("toggled", addon.name, false);
    }

    static toggleAddon(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);

        if (this.isEnabled(addon)) this.disableAddon(addon);
        else this.enableAddon(addon);
    }

    static reloadAddon(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);
        this.unloadAddon(addon, false);

        this.loadAddon(addon.path, false,  false);
        Toasts.show(`${addon.name} was reloaded!`, {type: "success"});
        if (SettingsManager.isEnabled("showToastsPluginReload")) Logger.log("PluginsManager", `${addon.name} was reloaded!`);
    }

    static onSwitch() {
        for (const plugin of this.addons) {
            if (typeof (plugin.instance.onSwitch) !== "function" || !this.isEnabled(plugin)) continue;

            try {plugin.instance.onSwitch();}
            catch (error) {Logger.error("PluginsManager", `Unable to fire onSwitch() for ${plugin.name}:`, error);} 
        }
    }

    static onMutate(changes) {
        for (const plugin of this.addons) {
            if (typeof (plugin.instance.observer) !== "function" || !this.isEnabled(plugin)) continue;

            try {plugin.instance.observer(changes);}
            catch (error) {Logger.error("PluginsManager", `Unable to fire observer() for ${plugin.name}:`, error);}
        }
    }
}