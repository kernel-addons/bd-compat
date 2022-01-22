/// <reference path="../../types.d.ts" />

import fs from "./modules/api/fs.js";
import path from "./modules/api/path.js";
import BdApi from "./modules/bdapi.js";
import DataStore from "./modules/datastore.js";
import DiscordModules from "./modules/discord.js";
import DOM from "./modules/dom.js";
import Patcher from "./modules/patcher.js";
import PluginsManager from "./modules/pluginsmanager.js";
import Require from "./modules/require.js";
import ThemesManager from "./modules/themesmanager.js";
import Toasts from "./modules/toasts.js";
import Webpack from "./modules/webpack";
import AddonPanel from "./ui/addonpanel.js";
import SettingsPanel from "./ui/settings.js";
import Buffer, {setBuffer} from "./modules/api/buffer";
import Logger from "./modules/logger.js";
import SettingsManager from "./modules/settingsmanager.js";
import AddonUpdater from "./modules/addonupdater.js";
import * as IPCEvents from "../common/IPCEvents";

const SettingsSections = [
    {section: "DIVIDER"},
    {
        section: "HEADER",
        label: "BetterDiscord"
    },
    {
        id: "bdcompat-settings-settings",
        section: "settings",
        label: "Settings",
        className: "bdcompat-settings-item-settings",
        element: () => DiscordModules.React.createElement(SettingsPanel, {})
    },
    {
        id: "bdcompat-settings-plugins",
        section: "plugins",
        label: "Plugins",
        className: "bdcompat-settings-item-plugins",
        element: () => DiscordModules.React.createElement(AddonPanel, {manager: PluginsManager, type: "plugin"})
    },
    {
        id: "bdcompat-settings-themes",
        section: "themes",
        label: "Themes",
        className: "bdcompat-settings-item-themes",
        element: () => DiscordModules.React.createElement(AddonPanel, {manager: ThemesManager, type: "theme"})
    }
];

if (!window.process) {
    BDCompatNative.IPC.dispatch(IPCEvents.EXPOSE_PROCESS_GLOBAL);
}

export default new class BDCompat {
    styles = ["./ui/toast.css", "./ui/addons.css", "./ui/settings.css"];

    start() {
        Logger.log("Core", "Loading...");
        Webpack.whenReady.then(this.onStart.bind(this));
    }

    onStart() {
        this.polyfillWebpack();
        setBuffer(Webpack.findByProps("Buffer"));
        Object.assign(window, {
            require: Require,
            Buffer: Buffer.Buffer,
            React: DiscordModules.React
        });

        this.exposeBdApi();

        this.patchSettingsView();

        DataStore.initialize();
        SettingsManager.initialize();
        Toasts.initialize();
        this.appendStyles();

        ThemesManager.initialize();
        PluginsManager.initialize();
        AddonUpdater.initialize();
    }

    exposeBdApi() {
        Object.freeze(BdApi);
        Object.freeze(BdApi.Plugins);
        Object.freeze(BdApi.Themes);
        Object.freeze(BdApi.Patcher);

        Object.defineProperty(window, "BdApi", {
            value: BdApi,
            configurable: false,
            writable: false
        });
    }

    polyfillWebpack() {
        if (typeof(webpackJsonp) !== "undefined") return;

        window.webpackJsonp = [];
        
        Object.defineProperty(window.webpackJsonp, "__polyfill", {value: true});

        window.webpackJsonp.length = 10000; // In case plugins are waiting for that.
        window.webpackJsonp.flat = () => window.webpackJsonp;

        window.webpackJsonp.push = ([[], module, [[id]]]) => {
            return module[id]({}, {}, Webpack.request(false));
        };
    }

    appendStyles() {
        const dist = BDCompatNative.executeJS("__dirname", new Error().stack);
        const stylesPath = path.resolve(dist, "style.css");
        if (!fs.existsSync(stylesPath)) return;

        DOM.injectCSS("core", fs.readFileSync(stylesPath, "utf8"));
    }

    patchSettingsView() {
        const SettingsView = Webpack.findByDisplayName("SettingsView");

        Patcher.after("BDCompatSettings", SettingsView.prototype, "getPredicateSections", (_, __, res) => {
            if (!Array.isArray(res) || !res.some(e => e?.section?.toLowerCase() === "changelog") || res.some(s => s?.id === "bdcompat-settings-settings")) return;

            const index = res.findIndex(s => s?.section?.toLowerCase() === "changelog") - 1;
            if (index < 0) return;

            res.splice(index, 0, ...SettingsSections);
        });
    }
}