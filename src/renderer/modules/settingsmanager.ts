import defaultSettings from "../data/settings.json";
import DataStore from "./datastore";
import Logger from "./logger";

export default class SettingsManager {
    static listeners = new Set<Function>();

    static defaultSettings = defaultSettings;

    static states = {};

    static settings = {};

    static get items() {return defaultSettings;}

    static initialize(): void {
        this.states = DataStore.getSettings();

        const loadSetting = (settings: any[], requires = []) => {
            for (const setting of settings) {
                if (setting.type === "category") {
                    loadSetting(setting.items, setting.requires);
                    continue;
                }

                this.settings[setting.id] = {
                    type: setting.type,
                    get value() {return SettingsManager.states[setting.id] ?? setting.value},
                    requires: requires
                };
            }
        };

        for (let collectionId in this.defaultSettings) {
            const collection = this.defaultSettings[collectionId];
            if (!collection.settings) continue;

            loadSetting(collection.settings);
        }
    }

    static setSetting(id: string, value: any) {
        this.states[id] = value;
        DataStore.setSettings(id, value);
        this.alertListeners(id, value);
    }

    static isEnabled(id: string): boolean {
        const setting = this.settings[id];
        if (!setting) return false;

        return setting.value && setting.requires.every((id: string) => this.isEnabled(id));
    }

    // Listener stuff
    static addListener(callback: Function) {
        this.listeners.add(callback);

        return () => this.removeListener(callback);
    }

    static removeListener(callback: Function) {
        return this.listeners.delete(callback);
    }

    static alertListeners(...args: any[]) {
        for (const callback of this.listeners) {
            try {callback(...args);}
            catch (error) {Logger.error("SettingsManager", "Could not fire listener:", error);}
        }
    }

    static useState(factory: () => any) {
        const [state, setState] = React.useState(factory());

        React.useEffect(() => {
            return this.addListener(() => setState(factory()));
        });

        return state;
    }
}