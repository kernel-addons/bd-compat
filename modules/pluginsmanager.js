import fs from "./api/fs.js";
import path from "./api/path.js";
import DataStore from "./datastore.js";
import Logger from "./logger.js";
import Toasts from "./toasts.js";
import Utilities from "./utilities.js";

export default class PluginsManager {
    static folder = DataStore.pluginsFolder;

    static extension = ".plugin.js";

    static addons = []; 

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
        let lastCall = new Date();

        this.watcher = fs.watch(this.folder, {persistent: false}, (eventType, filename) => {
            if (!eventType || !filename || new Date() - lastCall < 100) return;
            lastCall = new Date();
            const absolutePath = path.resolve(this.folder, filename);
            if (!filename.endsWith(this.extension)) return;
            
            // await new Promise(r => setTimeout(r, 100));
            try {
                const stats = fs.statSync(absolutePath);
                if (!stats.isFile()) return;
                if (eventType == "rename") this.loadAddon(absolutePath, true);
                if (eventType == "change") this.reloadAddon(absolutePath, true);
            }
            catch (err) {
                if (err.code !== "ENOENT") return;
                this.unloadAddon(absolutePath, true);
            }
        });
    }

    static loadAllPlugins() {
        for (const filename of fs.readdirSync(this.folder, "utf8")) {
            const location = path.resolve(this.folder, filename);
            if (!filename.endsWith(this.extension) || !fs.statSync(location).isFile()) continue;

            try {
                this.loadAddon(location);
            } catch (error) {
                Logger.error("PluginsManager", `Failed to load plugin ${filename}:`, error);
            }
        }
    }

    static compile(filecontent, name) {
        return `((module, exports, __dirname, __filename) => {\n${filecontent}\nif (!module.exports || !module.exports.prototype) {module.exports = eval(${JSON.stringify(name)});}\n})//# sourceURL=kernel://bd-compat/plugins/${name}.plugin.js`;
    }

    static resolve(idOrFileOrAddon) {
        return this.addons.find(addon => addon.id === idOrFileOrAddon || addon.name === idOrFileOrAddon || addon.path === idOrFileOrAddon || addon === idOrFileOrAddon);
    }

    static loadAddon(location, showToast = true) {
        const filecontent = fs.readFileSync(location, "utf8");
        const meta = Utilities.parseMETA(filecontent);
        meta.filename = path.basename(location);
        meta.path = location;

        if (this.resolve(meta.name) || this.resolve(meta.filename)) throw new Error(`There's already a plugin with name ${meta.name || meta.filename}!`);

        let exports = {};
        try {eval(this.compile(filecontent, meta.name))(exports, exports, path.dirname(location), location);}
        catch (error) {
            Logger.error("PluginsManager", `Failed to compile ${meta.name || path.basename(location)}:`, error);
        }
        
        meta.exports = exports.toString().split(" ")[0] === "class"
            ? exports
            : exports.__esModule
                ? (exports.default || exports.exports.default)
                : exports.exports;

        try {
            const instance = new meta.exports(meta);
            meta.instance = instance;
            if (typeof (instance.load) === "function") {
                try {
                    instance.load(meta);
                    Logger.log("PluginsManager", `${meta.name} was loaded!`);
                    if (showToast) Toasts.show(`${meta.name} was loaded!`, {type: "success"});
                } catch (error) {
                    Logger.error("PluginsManager", `Unable to fire load() for ${meta.name || meta.filename}:`, error);
                }
            }
            this.addons.push(meta);

            if (this.addonState[meta.name]) this.startPlugin(meta);
        } catch (error) {
            Logger.error("PluginsManager", `Unable to load ${meta.name || meta.filename}:`, error);
        }

        if (meta.instance) return meta;
    }

    static unloadAddon(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);
        if (!addon) return;

        this.stopPlugin(addon, false);
        this.addons.splice(this.addons.indexOf(addon), 1);
        Logger.log("PluginsManager", `${addon.name} was unloaded!`);
        Toasts.show(`${addon.name} was unloaded!`);
    }

    static startPlugin(plugin, showToast = true) {
        const addon = this.resolve(plugin);
        if (!addon) return;

        try {
            if (typeof(addon.instance.start) === "function") addon.instance.start();
            if (showToast) {
                Logger.log("PluginsManager", `${addon.name} has been started!`);
                Toasts.show(`${addon.name} has been started!`);
            }
        } catch (error) {
            Logger.error("PluginsManager", `Unable to fire start() for ${addon.name}:`, error);
            Toasts.show(`${addon.name} could not be started!`);
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
                Toasts.show(`${addon.name} could not be stopped!`);
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
            Toasts.show(`${addon.name} has been enabled!`);
        }

        this.addonState[addon.name] = success;

        DataStore.saveAddonState("plugins", this.addonState);
    }

    static disableAddon(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);
        if (!addon) return Logger.warn("PluginsManager", `Unable to disable non-loaded addon!`);

        if (!this.isEnabled(addon)) return Logger.warn("PluginsManager", `Cannot disable addon twice!`);
        
        const success = this.stopPlugin(addon, false);
        if (success) {
            Logger.log("PluginsManager", `${addon.name} has been stopped!`);
            Toasts.show(`${addon.name} has been stopped!`);
        }
        
        this.addonState[addon.name] = false;
        DataStore.saveAddonState("plugins", this.addonState);
    }

    static toggleAddon(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);

        if (this.isEnabled(addon)) this.disableAddon(addon);
        else this.enableAddon(addon);
    }

    static reloadAddon(idOrFileOrAddon) {
        const success = this.stopPlugin(idOrFileOrAddon);
        if (!success) return;

        this.startPlugin(idOrFileOrAddon);
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