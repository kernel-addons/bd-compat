import fs from "./api/fs.js";
import path from "./api/path.js";
import Logger from "./logger.js";

export default class DataStore {
    static pluginData = {};
    static pluginsFolder = path.resolve(BDCompatNative.getBasePath(), "plugins");
    static themesFolder = path.resolve(DataStore.pluginsFolder, "..", "themes");
    static dataFolder = path.resolve(DataStore.pluginsFolder, "..", "config");

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
    }

    static tryLoadPluginData(pluginName) {
        this.pluginData[pluginName] = {};
        const config = path.join(this.pluginsFolder, `${pluginName}.config.json`);

        try {
            if (!fs.existsSync(config)) return null;
            const data = JSON.parse(fs.readFileSync(config, "utf8"));
            this.pluginData[pluginName] = data;
        } catch (error) {
            Logger.error("DataStore", `PluginData for ${pluginName} seems corrupted.`, error);
        }
    }

    static saveData(pluginName, data) {
        try {
            fs.writeFileSync(path.resolve(this.pluginsFolder, `${pluginName}.config.json`), JSON.stringify(data, null, "\t"), "utf8");
        } catch (error) {
            Logger.error("DataStore", `Failed to save PluginData for ${pluginName}:`, error);
        }
    }

    static setPluginData(pluginName, key, value) {
        const data = Object.assign({}, this.pluginData[pluginName], {[key]: value});
        this.pluginData[pluginName] = data;

        this.saveData(pluginName, data);
    }

    static getPluginData(pluginName, key) {
        if (!this.pluginData[pluginName]) {
            this.tryLoadPluginData(pluginName);
        }

        return this.pluginData[pluginName]?.[key];
    }

    static deletePluginData(pluginName, key) {
        if (!this.pluginData[pluginName]) {
            this.tryLoadPluginData(pluginName);
        }

        if (!this.pluginData[pluginName]) return;

        if (typeof(this.pluginData[pluginName]?.[key]) !== "undefined") delete this.pluginData[pluginName]?.[key];
        this.saveData(pluginName, this.pluginData[pluginName]);
    }
}