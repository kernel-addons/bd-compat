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
import Webpack from "./modules/webpack.js";
import AddonPanel from "./ui/addonpanel.js";
import SettingsPanel from "./ui/settings.js";
import {Buffer} from "./modules/buffer.js";

const SettingsSections = [
    {section: "DIVIDER"},
    {
        section: "HEADER",
        label: "BDCompat"
    },
    {
        id: "bdcompat-settings-settings",
        section: "BDCompatSettings",
        label: "Settings",
        className: "bdcompat-settings-item-settings",
        element: () => DiscordModules.React.createElement(SettingsPanel, {})
    },
    {
        id: "bdcompat-settings-plugins",
        section: "BDCompatPlugins",
        label: "Plugins",
        className: "bdcompat-settings-item-plugins",
        element: () => DiscordModules.React.createElement(AddonPanel, {manager: PluginsManager, type: "plugin"})
    },
    {
        id: "bdcompat-settings-themes",
        section: "BDCompatThemes",
        label: "Themes",
        className: "bdcompat-settings-item-themes",
        element: () => DiscordModules.React.createElement(AddonPanel, {manager: ThemesManager, type: "theme"})
    }
];

export default new class BDCompat {
    styles = ["./ui/toast.css", "./ui/addons.css"];

    start() {Webpack.whenReady.then(this.onStart.bind(this));}

    onStart() {
        this.polyfillWebpack();
        if (!Reflect.has(window, "__BDCOMPAT_LEAKED__")) {
            (window as any).require = Require;
            (window as any).Buffer = Buffer;
        }

        (window as any).React = DiscordModules.React;

        this.exposeBdApi();

        this.patchSettingsView();

        DataStore.initialize();
        Toasts.initialize();
        this.appendStyles();

        ThemesManager.initialize();
        PluginsManager.initialize();
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
        const root = BDCompatNative.executeJS("__dirname");

        for (const [index, style] of this.styles.entries()) {
            const location = path.resolve(root, "src", "renderer", style);
            if (!fs.existsSync(location)) return; // TODO: Bail out

            DOM.injectCSS("BDCompat-internal" + index, fs.readFileSync(location, "utf8"));
        }
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