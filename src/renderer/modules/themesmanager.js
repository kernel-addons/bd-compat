import fs from "./api/fs.js";
import path from "./api/path.js";
import DataStore from "./datastore.js";
import DOM from "./dom.js";
import Logger from "./logger.js";
import Toasts from "./toasts.js";
import Utilities from "./utilities.js";

export default class ThemesManager {
    static folder = DataStore.themesFolder;
    static extension = ".theme.css";

    static listeners = {};

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
        this.addonState = DataStore.getAddonState("themes");
        Logger.log("ThemesManager", "Loading themes...");
        this.loadAllThemes();
        this.watchAddons();
    }

    static resolve(idOrFileOrAddon) {
        return this.addons.find(addon => addon.id === idOrFileOrAddon || addon.name === idOrFileOrAddon || addon.path === idOrFileOrAddon || addon === idOrFileOrAddon);
    }

    static isEnabled(idOrFileOrAddon) {
        const addon = this.resolve(idOrFileOrAddon);
        if (!addon) return;

        return this.addonState[addon.name] ?? false;
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
                if (!stats.isFile() || !stats.mtime) return;
                if (this.times[filename] === stats.mtime.getTime()) return;
                this.times[filename] = stats.mtime.getTime();

                if (eventType == "rename") this.loadTheme(absolutePath, true);
                if (eventType == "change") this.reloadAddon(absolutePath, true);
            }
            catch (err) {
                if (fs.existsSync(absolutePath)) return;
                this.unloadAddon(absolutePath, true);
            }
        });
    }

    static loadAllThemes() {
        for (const filename of fs.readdirSync(this.folder, "utf8")) {
            const location = path.resolve(this.folder, filename);
            const stats = fs.statSync(location);
            if (!filename.endsWith(this.extension) || !stats.isFile()) continue;
            this.times[filename] = stats.mtime.getTime();

            try {
                this.loadTheme(location, false);
                this.dispatch("updated");
            } catch (error) {
                Logger.error("ThemesManager", `Failed to load ${filename}:`, error);                
            }
        }
    }

    static loadTheme(location, showToast = true) {
        const filecontent = fs.readFileSync(location, "utf8");
        const meta = Utilities.parseMETA(filecontent);
        meta.filename = path.basename(location);
        meta.path = location;
        meta.css = filecontent;

        if (this.resolve(meta.name)) throw new Error(`A theme with name ${meta.name} already exists!`);
        this.addons.push(meta);

        if (!(meta.name in this.addonState)) {
            this.addonState[meta.name] = false;
            DataStore.saveAddonState("themes", this.addonState);
        }

        if (this.addonState[meta.name]) {
            this.applyTheme(meta, showToast);
        }

        return meta;
    }

    static unloadAddon(addon, showToast = true) {
        const theme = this.resolve(addon);
        if (!theme) return

        this.removeTheme(theme, false);
        this.addons.splice(this.addons.indexOf(theme), 1);
        if (showToast) {
            Logger.log("ThemesManager", `${theme.name} was unloaded!`);
            Toasts.show(`${theme.name} was unloaded!`, {type: "info"});
        } 
        this.dispatch("updated");
    }

    static applyTheme(addon, showToast = true) {
        const theme = this.resolve(addon);
        if (!theme) return; 

        theme.element = DOM.injectCSS(theme.name + "theme", theme.css);
        if (showToast) {
            Toasts.show(`${theme.name} has been applied!`, {type: "success"});
            Logger.log("ThemesManager", `${theme.name} has been applied!`);
        }
    }

    static removeTheme(addon, showToast = true) {
        const theme = this.resolve(addon);
        if (!theme || !theme.element || !DOM.head.contains(theme.element)) return;

        theme.element.remove();
        delete theme.element;
        delete theme.css;

        if (showToast) {
            Logger.log("ThemesManager", `${theme.name} has been removed!`);
            Toasts.show(`${theme.name} has been removed!`, {type: "info"});
        }
    }

    static reloadAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme || !this.isEnabled(theme)) return;

        this.unloadAddon(theme, false);
        this.loadTheme(theme.path, false);

        Logger.log("ThemesManager", `${theme.name} was reloaded!`);
        Toasts.show(`${theme.name} was reloaded!`, {type: "success"});
    }

    static enableAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme || this.isEnabled(theme)) return;

        this.applyTheme(theme, false);
        Logger.log("ThemesManager", `${theme.name} has been enabled!`);
        Toasts.show(`${theme.name} has been applied.`);

        this.addonState[theme.name] = true;
        
        DataStore.saveAddonState("themes", this.addonState);
        this.dispatch("toggled", theme.name, true);
    }

    static disableAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme || !this.isEnabled(theme)) return;

        this.removeTheme(theme, false);
        Logger.log("ThemesManager", `${theme.name} has been removed!`);
        Toasts.show(`${theme.name} has been removed.`, {type: "info"});

        this.addonState[theme.name] = false;
        
        DataStore.saveAddonState("themes", this.addonState);
        this.disableAddon("toggled", theme.name, false);
    }

    static toggleAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme) return;

        if (this.isEnabled(addon)) this.disableAddon(addon);
        else this.enableAddon(addon);
    }
}