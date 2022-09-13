import path from "./api/path.js";
import DataStore from "./datastore.js";
import DiscordModules from "./discord.js";
import DOM from "./dom.js";
import Logger from "./logger.js";
import Modals from "./modals.js";
import Patcher from "./patcher.js";
import PluginsManager from "./pluginsmanager.js";
import ThemesManager from "./themesmanager.js";
import Toasts from "./toasts.js";
import Webpack from "./webpack";

const createAddonAPI = manager => new class AddonAPI {
    get folder() {return manager.folder;}

    isEnabled(idOrFile) {return manager.isEnabled(idOrFile);}

    enable(idOrAddon) {return manager.enableAddon(idOrAddon);}

    disable(idOrAddon) {return manager.disableAddon(idOrAddon);}

    toggle(idOrAddon) {return manager.toggleAddon(idOrAddon);}

    reload(idOrAddon) {return manager.reloadAddon(idOrAddon);}

    get(idOrFile) {return manager.resolve(idOrFile);}

    getAll() {return manager.addons.map(addon => this.get(addon));}

    on(event, listener) {return manager.on(event, listener);}

    off(event, listener) {return manager.off(event, listener);}

    delete(idOrAddon) {return manager.delete(idOrAddon);}
};

export default class BdApi {
    static get version() {return "0.0.0";}

    static get React() {return DiscordModules.React;}

    static get ReactDOM() {return DiscordModules.ReactDOM;}

    static get WindowConfigFile() {return "";}

    static get settings() {return [];}

    static isSettingEnabled() {return true;}

    static disableSetting() {}

    static enableSetting() {}

    static __getPluginConfigPath(plugin) {return path.resolve(this.Plugins.folder, "..", "config", `${plugin}.json`);}

    static injectCSS(id, css) {return DOM.injectCSS(id, css);}

    static clearCSS(id) {return DOM.clearCSS(id);}

    static alert(title, content) {return Modals.alert(title, content);}

    static showConfirmationModal(title, content, options) {return Modals.showConfirmationModal(title, content, options);}

    static showToast(content, options) {return Toasts.show(content, options);}

    static findModule(filter) {return Webpack.findModule(filter);}

    static findAllModules(filter) {return Webpack.findModules(filter);}

    static findModuleByProps(...props) {return Webpack.findByProps(...props);}

    static findModuleByDisplayName(displayName) {return Webpack.findByDisplayName(displayName);}

    static findModuleByPrototypes(...protos) {return Webpack.findModule(m => typeof (m) === "function" && protos.every(proto => proto in m.prototype));}

    static getInternalInstance(node) {return node?.__reactFiber$;}

    static suppressErrors(method, message) {
        return (...args) => {
            try {return method(...args);}
            catch (error) {Logger.error("SuppressErrors", message, error);}
        };
    }

    static testJSON(json) {
        try {return JSON.parse(json);}
        catch {return false;}
    }

    static loadData(pluginName, key) {return DataStore.getPluginData(pluginName, key);}

    static saveData(pluginName, key, value) {return DataStore.setPluginData(pluginName, key, value);}

    static deleteData(pluginName, key) {return DataStore.deletePluginData(pluginName, key);}

    static get getData() {return this.loadData;}

    static get setData() {return this.saveData;};

    static monkeyPatch(module, functionName, options) {
        const {before, after, instead, once = false} = options;
        const patches = [];

        const makePatch = (type, callback) => {
            const data = {
                originalMethod: module[functionName],
                callOriginalMethod: () => Reflect.apply(data.originalMethod, data.thisObject, data.methodArguments)
            };

            patches.push(
                data.cancelPatch = Patcher[type]("BDCompatPatch-monkeyPatch", module, functionName, (_this, args, rest) => {
                    data.thisObject = _this;
                    data.methodArguments = args;
                    data.returnValue = rest;

                    try {
                        const tempRet = Reflect.apply(callback, null, [data]);
                        if (once) data.cancelPatch();
                        return tempRet;
                    } catch (error) {
                        Logger.error(`BdApi.monkeyPatch`, `Error in the ${type} callback of ${functionName}:`, error);
                    }
                })
            );
        };

        if (typeof (before) === "function") makePatch("before", before);
        if (typeof (after) === "function") makePatch("after", after);
        if (typeof (instead) === "function") makePatch("instead", instead);

        return () => {
            for (const patch of patches) patch();
        };
    }

    static Plugins = createAddonAPI(PluginsManager);

    static Themes = createAddonAPI(ThemesManager);

    static Patcher = {
        patch(caller, module, functionName, callback, options) {
            if (typeof (caller) !== "string") return Logger.error("BdApi.Patcher", `Parameter 0 of patch must be a string representing the caller`);
            if (["after", "before", "instead"].includes(options.type)) return Logger.error("BdApi.Patcher", `options.type must be one of (before | after | instead). Received ${options.type}.`);

            return Patcher[options.type](caller, module, functionName, callback);
        },
        getPatchesByCaller(caller) {
            if (typeof (caller) !== "string") return Logger.error("BDCompat", `Argument "caller" must be a typeof string. Received ${typeof (caller)} instead`);

            return Patcher.getPatchesByCaller(caller);
        },
        unpatchAll(caller) {
            if (typeof (caller) !== "string") return Logger.error("BDCompat", `Argument "caller" must be a typeof string. Received ${typeof (caller)} instead`);

            return Patcher.unpatchAll(caller);
        },
        ...Object.fromEntries(["before", "after", "instead"].map(type => [
            type,
            function (caller, module, functionName, callback) {return Patcher[type](caller, module, functionName, callback);}
        ]))
    };

    static onRemoved(node, callback) {
        return new MutationObserver((changes, observer) => {
            for (const change of changes) {
                for (const removed of change.removedNodes) {
                    if (removed === node) {
                        observer.disconnect();
                        callback();
                    } else if (removed.contains(node)) {
                        observer.disconnect();
                        callback();
                    }
                }
            }
        }).observe(document, {childList: true, subtree: true});
    }

    static Webpack = {
        Filters: Webpack.Filters,
        getModule: Webpack.findModule.bind(Webpack),
        getBulk: Webpack._getBulk.bind(Webpack),
        waitForModule: () => new Promise()
    };
};

Object.defineProperties(BdApi, Reflect.ownKeys(BdApi).slice(2).reduce((descriptors, key) => {
    if (key === "prototype") return descriptors;

    descriptors[key] = Object.assign({}, Object.getOwnPropertyDescriptor(BdApi, key), {enumerable: true});

    return descriptors;
}, {}));