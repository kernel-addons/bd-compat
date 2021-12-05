import ToastsContainer from "../ui/toasts.js";
import DiscordModules from "./discord.js";
import DOM from "./dom.js";
import Logger from "./logger.js";
import memoize from "./memoize.js";
import SettingsManager from "./settingsmanager";
import createStore from "./zustand.js";

export class Converter {
    static convertType(type) {
        switch (type?.toLowerCase()) {
            case "info": return DiscordModules.Toasts.ToastType.MESSAGE;
            case "error": return DiscordModules.Toasts.ToastType.FAILURE;
            case "success": return DiscordModules.Toasts.ToastType.SUCCESS;

            default: return DiscordModules.Toasts.ToastType.MESSAGE;
        }
    }
}

export default class Toasts {
    static dispose() {return DiscordModules.ReactDOM.unmountComponentAtNode(this.container);}

    static get container() {
        return memoize(this, "container", () => DOM.createElement("div", {
            className: "bd-toasts"
        }));
    }

    static initialize() {
        const [useStore, Api] = createStore({toasts: []});

        document.body.appendChild(this.container);

        this.API = Api;

        DiscordModules.ReactDOM.render(DiscordModules.React.createElement(ToastsContainer, {
            useStore,
            setState: Api.setState
        }), this.container);
    }

    static showDiscordToast(content, options) {
        try {
            setImmediate(() => {
                const type = Converter.convertType(options.type);
                const toast = DiscordModules.Toasts.createToast(content, type);
                DiscordModules.Toasts.showToast(toast);
            });
            return;
        } catch (error) {
            Logger.error("Toasts", "Failed to show discord's toast:", error);
        }
    }

    static show(content, options = {}) {
        if (!SettingsManager.isEnabled("showToasts")) return;

        if (SettingsManager.isEnabled("useBuiltinToasts")) return this.showDiscordToast(content, options);

        // NotLikeThis
        setImmediate(() => {
            this.API.setState(state => ({...state, id: Math.random().toString(36).slice(2), toasts: state.toasts.concat({content, timeout: 3000, ...options})}));
        });
    }
}