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

    static addons = [];

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

    static loadAllThemes() {
        for (const filename of fs.readdirSync(this.folder, "utf8")) {
            const location = path.resolve(this.folder, filename);
            if (!filename.endsWith(this.extension) || !fs.statSync(location).isFile()) continue;

            try {
                this.loadTheme(location);
            } catch (error) {
                Logger.error("ThemesManager", `Failed to load ${filename}:`, error);                
            }
        }
    }

    static loadTheme(location) {
        const filecontent = fs.readFileSync(location, "utf8");
        const meta = Utilities.parseMETA(filecontent);
        meta.filename = path.basename(location);
        meta.path = location;

        if (this.resolve(meta.name)) throw new Error(`A theme with name ${meta.name} already exists!`);
        this.addons.push(meta);

        meta.css = filecontent;

        if (this.addonState[meta.name]) {
            this.applyTheme(meta);
        }
    }

    static applyTheme(addon, showToast = true) {
        const theme = this.resolve(addon);
        if (!theme) return; 

        theme.element = DOM.injectCSS(theme.name + "theme", theme.css);
        if (showToast) {
            Toasts.show(`${theme.name} has been applied!`);
            Logger.log("ThemesManager", `${theme.name} has been applied!`);
        }
    }

    static removeTheme(addon, showToast = true) {
        const theme = this.resolve(addon);
        if (!theme || !theme.element || !DOM.head.contains(theme.element)) return;

        theme.element.remove();
        delete theme.element;

        if (showToast) {
            Logger.log("ThemesManager", `${theme.name} has been removed!`);
            Toasts.show(`${theme.name} has been removed!`);
        }
    }

    static reloadAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme) return;

        this.removeTheme(theme, false);
        this.applyTheme(theme, false);

        Logger.log("ThemesManager", `${theme.name} was reloaded!`);
        Toasts.show(`${theme.name} was reloaded!`);
    }

    static enableAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme || this.isEnabled(theme)) return;

        this.applyTheme(theme, false);
        Logger.log("ThemesManager", `${theme.name} has been enabled!`);
        Toasts.show(`${theme.name} has been applied.`);

        this.addonState[theme.name] = true;
        
        DataStore.saveAddonState("themes", this.addonState);
    }

    static disableAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme || !this.isEnabled(theme)) return;

        this.removeTheme(theme, false);
        Logger.log("ThemesManager", `${theme.name} has been removed!`);
        Toasts.show(`${theme.name} has been removed.`);

        this.addonState[theme.name] = false;
        
        DataStore.saveAddonState("themes", this.addonState);
    }

    static toggleAddon(addon) {
        const theme = this.resolve(addon);
        if (!theme) return;

        if (this.isEnabled(addon)) this.disableAddon(addon);
        else this.enableAddon(addon);
    }
}