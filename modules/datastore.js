import fs from "./api/fs.js";
import path from "./api/path.js";
import Logger from "./logger.js";

export default class DataStore {
    static pluginData = {};
    static pluginsFolder = path.resolve(BDCompatNative.executeJS("__dirname"), "plugins");
    static themesFolder = path.resolve(this.pluginsFolder, "..", "themes");
    static dataFolder = path.resolve(this.pluginsFolder, "..", "config");

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
        if (!fs.existsSync(this.pluginsFolder)) {
            try {
                fs.mkdirSync(this.pluginsFolder);
            } catch (error) {
                Logger.error("DataStore", `Failed to create missing plugins folder:`, error);
            }
        }

        if (!fs.existsSync(this.themesFolder)) {
            try {
                fs.mkdirSync(this.themesFolder);
            } catch (error) {
                Logger.error("DataStore", `Failed to create missing themes folder:`, error);
            }
        }

        if (!fs.existsSync(this.dataFolder)) {
            try {
                fs.mkdirSync(this.dataFolder);
            } catch (error) {
                Logger.error("DataStore", `Failed to create missing config folder:`, error);
            }
        }
    }

    static tryLoadPluginData(pluginName) {
        this.pluginData[pluginName] = {};

        try {
            const data = JSON.parse(fs.readFileSync(path.join(this.dataFolder, `${pluginName}.json`), "utf8"));
            this.pluginData[pluginName] = data;
            return;
        } catch (error) {
            if (error.message.startsWith("ENOENT:")) return;

            Logger.error("DataStore", `PluginData for ${pluginName} seems corrupted.`, error);
        }
    }

    static saveData(pluginName, data) {
        try {
            fs.writeFileSync(path.resolve(this.dataFolder, `${pluginName}.json`), JSON.stringify(data, null, "\t"), "utf8");
        } catch (error) {
            Logger.error("DataStore", `Failed to save PluginData for ${pluginName}:`, error);
        }
    }

    static setPluginData(pluginName, key, value) {
        const data = {settings: Object.assign({}, this.pluginData[pluginName]?.settings, {[key]: value})};
        this.pluginData[pluginName] = data;

        this.saveData(pluginName, data);
    }

    static getPluginData(pluginName, key) {
        if (!this.pluginData[pluginName]) {
            this.tryLoadPluginData(pluginName);
        }

        return this.pluginData[pluginName].settings?.[key];
    }

    static deletePluginData(pluginName, key) {
        if (!this.pluginData[pluginName]) {
            this.tryLoadPluginData(pluginName);
        }

        if (!this.pluginData[pluginName]) return;

        delete this.pluginData[pluginName].settings[key];
        this.saveData(pluginName, this.pluginData[pluginName]);
    }
}