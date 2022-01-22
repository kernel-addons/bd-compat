import fs from "./api/fs.js";
import path from "./api/path.js";
import Logger from "./logger.js";

export default class DataStore {
    static pluginData = {};
    static settingsData = null;
    static pluginsFolder = path.resolve(BDCompatNative.getBasePath(), "plugins");
    static themesFolder = path.resolve(DataStore.pluginsFolder, "..", "themes");
    static dataFolder = path.resolve(DataStore.pluginsFolder, "..", "config");
    static settingsFile = path.resolve(DataStore.dataFolder, "settings.json");

    static getAddonState(type) {
        try {
            return JSON.parse(fs.readFileSync(path.resolve(this.dataFolder, `${type}States.json`), "utf8"));
        } catch (error) {
            return {};
        }
    }

    static saveAddonState(type, state = {}) {
        try {
            fs.writeFileSync(path.resolve(this.dataFolder, `${type}States.json`), JSON.stringify(state, null, "\t"));
        } catch (error) {
            Logger.error("DataStore", `Unable to save addon states:`, error);
        }
    }

    static initialize() {
        const folders = ["config", "plugins", "themes"];

        Logger.log("DataStore", "Ensuring directories...");
        for (const folder of folders) {
            const location = path.resolve(BDCompatNative.getBasePath(), folder);
            if (fs.existsSync(location)) continue;

            try {
                fs.mkdirSync(location);
            } catch (error) {
                Logger.error("DataStore", `Failed to create missing ${folder} folder:`, error);
            }
        }

        Logger.log("DataStore", "Loading settings...");

        try {
            if (!fs.existsSync(this.settingsFile)) fs.writeFileSync(this.settingsFile, "{}", "utf8");
            this.settingsData = this.loadData("settings") ?? {};
        } catch (error) {
            Logger.error("DataStore", "Failed to load settings:", error);
            this.settingsData = {};
        }
    }

    static tryLoadPluginData(pluginName) {
        if (this.pluginData[pluginName]) return this.pluginData[pluginName];
        const config = path.join(this.pluginsFolder, `${pluginName}.config.json`);

        try {
            if (!fs.existsSync(config)) return null;
            this.pluginData[pluginName] = this.loadData(pluginName, this.pluginsFolder, ".config.json");
        } catch (error) {
            Logger.error("DataStore", `PluginData for ${pluginName} seems corrupted.`, error);
        }
    }

    static saveData(type, data, _path = DataStore.dataFolder, extension = ".json") {
        try {
            fs.writeFileSync(path.resolve(_path, `${type}${extension}`), JSON.stringify(data, null, "\t"), "utf8");
        } catch (error) {
            Logger.error("DataStore", "Failed to save data:", error);
        }
    }

    static loadData(type, _path = DataStore.dataFolder, extension = ".json") {
        try {
            return JSON.parse(fs.readFileSync(path.resolve(_path, `${type}${extension}`), "utf8"));
        } catch (error) {
            Logger.error("DataStore", "Failed to load data:", error);
        }
    }

    static setPluginData(pluginName, key, value) {
        const data = Object.assign({}, this.pluginData[pluginName], {[key]: value});
        this.pluginData[pluginName] = data;

        this.saveData(pluginName, data, this.pluginsFolder, ".config.json");
    }

    static getPluginData(pluginName, key) {
        if (!this.pluginData[pluginName]) {
            this.tryLoadPluginData(pluginName);
        }

        return this.pluginData[pluginName]?.[key];
    }

    static setSettings(id, value) {
        const newSettings = Object.assign({}, this.settingsData, {[id]: value});
        
        try {
            this.saveData("settings", newSettings);
        } catch (error) {
            Logger.error("DataStore", "Failed to save settings:", error);
        }
    }

    static getSettings() {return this.settingsData;}

    static deletePluginData(pluginName, key) {
        if (!this.pluginData[pluginName]) {
            this.tryLoadPluginData(pluginName);
        }

        if (!this.pluginData[pluginName]) return;

        if (typeof(this.pluginData[pluginName]?.[key]) !== "undefined") delete this.pluginData[pluginName]?.[key];
        this.saveData(pluginName, this.pluginData[pluginName]);
    }
}