/// <reference path="../../../../types.d.ts" />
class fs {
	static readFileSync(path, options = "utf8") {
		return BDCompatNative.executeJS(`require("fs").readFileSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`, new Error().stack);
	}
	static writeFileSync(path1, data, options1) {
		return BDCompatNative.executeJS(`require("fs").writeFileSync(${JSON.stringify(path1)}, ${JSON.stringify(data)}, ${JSON.stringify(options1)})`, new Error().stack);
	}
	static writeFile(path2, data1, options2, callback) {
		if (typeof options2 === "function") {
			callback = options2;
			options2 = null;
		}
		const ret = {
			error: null
		};
		try {
			this.writeFileSync(path2, data1, options2);
		} catch (error) {
			ret.error = error;
		}
		callback(ret.error);
	}
	static readdirSync(path3, options3) {
		return BDCompatNative.executeJS(`require("fs").readdirSync(${JSON.stringify(path3)}, ${JSON.stringify(options3)});`, new Error().stack);
	}
	static existsSync(path4) {
		return BDCompatNative.executeJS(`require("fs").existsSync(${JSON.stringify(path4)});`, new Error().stack);
	}
	static mkdirSync(path5, options4) {
		return BDCompatNative.executeJS(`require("fs").mkdirSync(${JSON.stringify(path5)}, ${JSON.stringify(options4)});`, new Error().stack);
	}
	static statSync(path6, options5) {
		return BDCompatNative.executeJS(`
            const stats = require("fs").statSync(${JSON.stringify(path6)}, ${JSON.stringify(options5)});
            const ret = {
                ...stats,
                isFile: () => stats.isFile(),
                isDirectory: () => stats.isDirectory()
            };
            ret
        `, new Error().stack);
	}
	static watch(path7, options6, callback1) {
		if (typeof options6 === "function") {
			callback1 = options6;
			options6 = null;
		}
		const eventId = "bdcompat-watcher-" + Math.random().toString(36).slice(2, 10);
		BDCompatNative.IPC.on(eventId, (event, filename) => {
			callback1(event, filename);
		});
		return BDCompatNative.executeJS(`
            require("fs").watch(${JSON.stringify(path7)}, ${JSON.stringify(options6)}, (event, filename) => {
                BDCompatNative.IPC.dispatch(${JSON.stringify(eventId)}, event, filename);
            });
        `, new Error().stack);
	}
}
var fs$1 = typeof __BDCOMPAT_LEAKED__ === "undefined" ? fs : window.require("fs");

var path = typeof __BDCOMPAT_LEAKED__ === "undefined" ? BDCompatNative.executeJS(`require("path")`, new Error().stack) : window.require("path");

class Logger {
	static _parseType(type) {
		switch (type) {
			case "info":
			case "warn":
			case "error":
				return type;
			default:
				return "log";
		}
	}
	static _log(type1, module, ...nessage) {
		type1 = this._parseType(type1);
		console[type1](`%c[BetterDiscord]%c %c[${module}]%c`, "color: #3e82e5; font-weight: 700;", "", "color: #3e82e5", "", ...nessage);
	}
	static log(module1, ...message) {
		this._log("log", module1, ...message);
	}
	static info(module2, ...message1) {
		this._log("info", module2, ...message1);
	}
	static warn(module3, ...message2) {
		this._log("warn", module3, ...message2);
	}
	static error(module4, ...message3) {
		this._log("error", module4, ...message3);
	}
}

class DataStore {
	static getAddonState(type) {
		try {
			return JSON.parse(fs$1.readFileSync(path.resolve(this.dataFolder, `${type}States.json`), "utf8"));
		} catch (error) {
			return {
			};
		}
	}
	static saveAddonState(type1, state = {
		}) {
		try {
			fs$1.writeFileSync(path.resolve(this.dataFolder, `${type1}States.json`), JSON.stringify(state, null, "\t"));
		} catch (error) {
			Logger.error("DataStore", `Unable to save addon states:`, error);
		}
	}
	static initialize() {
		const folders = [
			"config",
			"plugins",
			"themes"
		];
		Logger.log("DataStore", "Ensuring directories...");
		for (const folder of folders) {
			const location = path.resolve(BDCompatNative.getBasePath(), folder);
			if (fs$1.existsSync(location)) continue;
			try {
				fs$1.mkdirSync(location);
			} catch (error) {
				Logger.error("DataStore", `Failed to create missing ${folder} folder:`, error);
			}
		}
		Logger.log("DataStore", "Loading settings...");
		try {
			if (!fs$1.existsSync(this.settingsFile)) fs$1.writeFileSync(this.settingsFile, "{}", "utf8");
			var ref;
			this.settingsData = (ref = this.loadData("settings")) !== null && ref !== void 0 ? ref : {
			};
		} catch (error) {
			Logger.error("DataStore", "Failed to load settings:", error);
			this.settingsData = {
			};
		}
	}
	static tryLoadPluginData(pluginName) {
		this.pluginData[pluginName] = {
		};
		const config = path.join(this.pluginsFolder, `${pluginName}.config.json`);
		try {
			if (!fs$1.existsSync(config)) return null;
			this.pluginData[pluginName] = this.loadData(pluginName, this.pluginsFolder, ".config.json");
		} catch (error) {
			Logger.error("DataStore", `PluginData for ${pluginName} seems corrupted.`, error);
		}
	}
	static saveData(type2, data, _path = DataStore.dataFolder, extension = ".json") {
		try {
			fs$1.writeFileSync(path.resolve(_path, `${type2}${extension}`), JSON.stringify(data, null, "\t"), "utf8");
		} catch (error) {
			Logger.error("DataStore", "Failed to save data:", error);
		}
	}
	static loadData(type3, _path1 = DataStore.dataFolder, extension1 = ".json") {
		try {
			return JSON.parse(fs$1.readFileSync(path.resolve(_path1, `${type3}${extension1}`), "utf8"));
		} catch (error) {
			Logger.error("DataStore", "Failed to load data:", error);
		}
	}
	static setPluginData(pluginName1, key, value) {
		const data = Object.assign({
		}, this.pluginData[pluginName1], {
			[key]: value
		});
		this.pluginData[pluginName1] = data;
		this.saveData(pluginName1, data, this.pluginsFolder, ".config.json");
	}
	static getPluginData(pluginName2, key1) {
		var ref;
		if (!this.pluginData[pluginName2]) {
			this.tryLoadPluginData(pluginName2);
		}
		return (ref = this.pluginData[pluginName2]) === null || ref === void 0 ? void 0 : ref[key1];
	}
	static setSettings(id, value1) {
		const newSettings = Object.assign({
		}, this.settingsData, {
			[id]: value1
		});
		try {
			this.saveData("settings", newSettings);
		} catch (error) {
			Logger.error("DataStore", "Failed to save settings:", error);
		}
	}
	static getSettings() {
		return this.settingsData;
	}
	static deletePluginData(pluginName3, key2) {
		var ref,
			ref1;
		if (!this.pluginData[pluginName3]) {
			this.tryLoadPluginData(pluginName3);
		}
		if (!this.pluginData[pluginName3]) return;
		if (typeof ((ref = this.pluginData[pluginName3]) === null || ref === void 0 ? void 0 : ref[key2]) !== "undefined")
			(ref1 = this.pluginData[pluginName3]) === null || ref1 === void 0 ? void 0 :
				delete ref1[key2];
		this.saveData(pluginName3, this.pluginData[pluginName3]);
	}
}
DataStore.pluginData = {
};
DataStore.settingsData = null;
DataStore.pluginsFolder = path.resolve(BDCompatNative.getBasePath(), "plugins");
DataStore.themesFolder = path.resolve(DataStore.pluginsFolder, "..", "themes");
DataStore.dataFolder = path.resolve(DataStore.pluginsFolder, "..", "config");
DataStore.settingsFile = path.resolve(DataStore.dataFolder, "settings.json");

function memoize(target, key, getter) {
	const value = getter();
	Object.defineProperty(target, key, {
		value: value,
		configurable: true
	});
	return value;
}

// @ts-nocheck
if (typeof Array.prototype.at !== "function") {
	Array.prototype.at = function(index) {
		return index < 0 ? this[this.length - Math.abs(index)] : this[index];
	};
}
if (typeof setImmediate === "undefined") {
	window.setImmediate = (callback) => setTimeout(callback, 0)
	;
}
class Filters {
	static byProps(...props1) {
		return (module) => props1.every((prop) => prop in module
		);
	}
	static byDisplayName(name, def = false) {
		return (module) => (def ? module = module.default : module) && typeof module === "function" && module.displayName === name;
	}
	static byTypeString(...strings) {
		return (module) => {
			var ref;
			return module.type && (module = (ref = module.type) === null || ref === void 0 ? void 0 : ref.toString()) && strings.every((str) => module.indexOf(str) > -1
				);
		};
	}
}
var Webpack = new class Webpack {
	get Filters() {
		return Filters;
	}
	get chunkName() {
		return "webpackChunkdiscord_app";
	}
	get id() {
		return "kernel-req" + Math.random().toString().slice(2, 5);
	}
	async waitFor(filter4, {retries =100, all =false, forever =false, delay =50} = {
		}) {
		for (let i = 0; i < retries || forever; i++) {
			const module = this.findModule(filter4, {
				all,
				cache: false
			});
			if (module) return module;
			await new Promise((res) => setTimeout(res, delay)
			);
		}
	}
	parseOptions(args, filter1 = (thing) => typeof thing === "object" && thing != null && !Array.isArray(thing)
	) {
		return [
			args,
			filter1(args.at(-1)) ? args.pop() : {
			}
		];
	}
	request(cache2 = true) {
		if (cache2 && this.cache) return this.cache;
		let req = undefined;
		if (Array.isArray(window[this.chunkName])) {
			const chunk = [
				[
					this.id
				],
				{
				},
				(__webpack_require__) => req = __webpack_require__
			];
			webpackChunkdiscord_app.push(chunk);
			webpackChunkdiscord_app.splice(webpackChunkdiscord_app.indexOf(chunk), 1);
		}
		if (!req) console.warn("[Webpack] Got empty cache.");
		if (cache2)
			this.cache = req;
		return req;
	}
	findModule(filter2, {all: all1 = false, cache: cache1 = true, force =false} = {
		}) {
		if (typeof filter2 !== "function") return void 0;
		const __webpack_require__ = this.request(cache1);
		const found = [];
		if (!__webpack_require__) return;
		const wrapFilter = function(module, index) {
			try {
				return filter2(module, index);
			} catch (e) {
				return false;
			}
		};
		for (const id in __webpack_require__.c) {
			const module = __webpack_require__.c[id].exports;
			if (!module || module === window) continue;
			switch (typeof module) {
				case "object": {
					if (wrapFilter(module, id)) {
						if (!all1) return module;
						found.push(module);
					}
					if (module.__esModule && module.default != null && wrapFilter(module.default, id)) {
						if (!all1) return module.default;
						found.push(module.default);
					}
					if (force && module.__esModule)
						for (const key in module) {
							if (!module[key]) continue;
							if (wrapFilter(module[key], id)) {
								if (!all1) return module[key];
								found.push(module[key]);
							}
					}
					break;
				}
				case "function": {
					if (wrapFilter(module, id)) {
						if (!all1) return module;
						found.push(module);
					}
					break;
				}
			}
		}
		return all1 ? found : found[0];
	}
	findModules(filter3) {
		return this.findModule(filter3, {
			all: true
		});
	}
	bulk(...options) {
		const [filters, {wait =false, ...rest}] = this.parseOptions(options);
		const found = new Array(filters.length);
		const searchFunction = wait ? this.waitFor : this.findModule;
		const wrappedFilters = filters.map((filter) => (m) => {
			try {
				return filter(m);
			} catch (error) {
				return false;
			}
		}
		);
		const returnValue = searchFunction.call(this, (module) => {
			for (let i = 0; i < wrappedFilters.length; i++) {
				const filter = wrappedFilters[i];
				if (typeof filter !== "function" || !filter(module) || found[i] != null) continue;
				found[i] = module;
			}
			return found.filter(String).length === filters.length;
		}, rest);
		if (wait) return returnValue.then(() => found
			);
		return found;
	}
	findByProps(...options1) {
		const [props, {bulk =false, wait =false, ...rest}] = this.parseOptions(options1);
		if (!bulk && !wait) {
			return this.findModule(Filters.byProps(...props), rest);
		}
		if (wait && !bulk) {
			return this.waitFor(Filters.byProps(...props), rest);
		}
		if (bulk) {
			const filters = props.map((propsArray) => Filters.byProps(...propsArray)
			).concat({
				wait,
				...rest
			});
			return this.bulk(...filters);
		}
		return null;
	}
	findByDisplayName(...options2) {
		const [displayNames, {bulk =false, default: defaultExport = false, wait =false, ...rest}] = this.parseOptions(options2);
		if (!bulk && !wait) {
			return this.findModule(Filters.byDisplayName(displayNames[0]), rest);
		}
		if (wait && !bulk) {
			return this.waitFor(Filters.byDisplayName(displayNames[0]), rest);
		}
		if (bulk) {
			const filters = displayNames.map(filters.map(Filters.byDisplayName)).concat({
				wait,
				cache
			});
			return this.bulk(...filters);
		}
		return null;
	}
	findIndex(filter) {
		let foundIndex = -1;
		this.findModule((module, index) => {
			if (filter(module))
				foundIndex = index;
		});
		return foundIndex;
	}
	atIndex(index) {
		var ref;
		return (ref = this.request(true)) === null || ref === void 0 ? void 0 : ref.c[index];
	}
	get waitForGlobal() {
		return new Promise(async (onExists) => {
			while (!Array.isArray(window[this.chunkName])) {
				await new Promise(setImmediate);
			}
			onExists();
		});
	}
	/**@deprecated Use Webpack.whenReady.then(() => {}) instead. */
	async wait(callback = null) {
		return this.whenReady.then(() => {
			typeof callback === "function" && callback();
		});
	}
	/**@deprecated Use Webpack.whenReady.then(() => {}) instead. */
	get whenExists() {
		return this.waitForGlobal;
	}
	/**@deprecated Use Webpack.whenReady.then(() => {}) instead. */
	on(event, listener1) {
		switch (event) {
			case "LOADED":
				return this.whenReady.then(listener1);
		}
	}
	/**@deprecated @see Webpack.on */
	get once() {
		return this.on;
	}
	constructor() {
		this.cache = null;
		this.whenReady = this.waitForGlobal.then(() => new Promise(async (onReady) => {
			const [Dispatcher, {ActionTypes} = {
				}] = await this.findByProps([
				"dirtyDispatch"
			], [
				"API_HOST",
				"ActionTypes"
			], {
				cache: false,
				bulk: true,
				wait: true,
				forever: true
			});
			const listener = function() {
				Dispatcher.unsubscribe(ActionTypes.START_SESSION, listener);
				onReady();
			};
			Dispatcher.subscribe(ActionTypes.START_SESSION, listener);
		})
		);
		window.Webpack = this;
	}
};

class DiscordModules {
	/**@returns {typeof import("react")} */
	static get React() {
		return memoize(this, "React", () => Webpack.findByProps("createElement", "createContext")
		);
	}
	/**@returns {typeof import("react-dom")} */
	static get ReactDOM() {
		return memoize(this, "ReactDOM", () => Webpack.findByProps("findDOMNode", "render", "createPortal")
		);
	}
	static get Tooltips() {
		return memoize(this, "Tooltips", () => Webpack.findByProps("TooltipContainer")
		);
	}
	static get DiscordProviders() {
		return memoize(this, "DiscordProviders", () => {
			const [{AccessibilityPreferencesContext: {Provider: AccessibilityProvider}} = {
					AccessibilityPreferencesContext: {
					}
				}, Layers, {LayerClassName} = {
				}] = Webpack.findByProps([
				"AccessibilityPreferencesContext"
			], [
				"AppReferencePositionLayer"
			], [
				"LayerClassName"
			], {
				bulk: true
			});
			return {
				AccessibilityProvider,
				LayerProvider: Layers.AppLayerProvider().props.layerContext.Provider,
				container: document.querySelector(`#app-mount > .${LayerClassName}`)
			};
		});
	}
	static get Toasts() {
		return memoize(this, "Toasts", () => {
			return Object.assign({
			}, ...Webpack.findByProps([
				"createToast"
			], [
				"showToast"
			], {
				bulk: true
			}));
		});
	}
	static get PrivateChannelActions() {
		return memoize(this, "PrivateChannelActions", () => Webpack.findByProps("openPrivateChannel")
		);
	}
	static get Dispatcher() {
		return memoize(this, "Dispatcher", () => Webpack.findByProps("dirtyDispatch")
		);
	}
	static get InviteActions() {
		return memoize(this, "InviteActions", () => Webpack.findByProps("resolveInvite")
		);
	}
	static get ContextMenu() {
		return memoize(this, "ContextMenu", () => {
			const [ContextMenuActions, ContextMenuComponents] = Webpack.findByProps([
				"openContextMenu"
			], [
				"MenuItem",
				"default"
			], {
				bulk: true
			});
			const output = {
				open: ContextMenuActions.openContextMenu,
				close: ContextMenuActions.closeContextMenu,
				Menu: ContextMenuComponents.default
			};
			for (let key in ContextMenuComponents) {
				if (!key.startsWith("Menu")) continue;
				output[key.slice("Menu".length)] = ContextMenuComponents[key];
			}
			return output;
		});
	}
}

class DOM {
	static get head() {
		return memoize(this, "head", () => document.head.appendChild(this.createElement("bd-head"))
		);
	}
	static createElement(type, options, ...children) {
		const node = Object.assign(document.createElement(type), options);
		node.append(...children);
		return node;
	}
	static injectCSS(id, css) {
		const element = this.createElement("style", {
			id,
			textContent: css
		});
		this.head.appendChild(element);
		return element;
	}
	static clearCSS(id1) {
		const element = this.head.querySelector(`style[id="${id1}"]`);
		if (element) element.remove();
	}
}

class Modals {
	static get ModalsAPI() {
		return memoize(this, "ModalsAPI", () => Webpack.findByProps("openModal", "useModalsStore")
		);
	}
	static get ModalComponents() {
		return memoize(this, "ModalComponents", () => Webpack.findByProps("ModalRoot", "ModalHeader")
		);
	}
	static get Forms() {
		return memoize(this, "Forms", () => Webpack.findByProps("FormTitle", "FormItem")
		);
	}
	static get Button() {
		return memoize(this, "Button", () => Webpack.findByProps("DropdownSizes")
		);
	}
	static get ConfirmationModal() {
		return memoize(this, "ConfirmationModal", () => Webpack.findByDisplayName("ConfirmModal")
		);
	}
	/**@returns {typeof import("react")} */
	static get Text() {
		return memoize(this, "Text", () => Webpack.findByDisplayName("Text")
		);
	}
	static showConfirmationModal(title, content, options = {
		}) {
		const {confirmText ="Okay", cancelText ="Cancel", onConfirm =() => {}, onCancel =() => {}} = options;
		return this.ModalsAPI.openModal((props) => DiscordModules.React.createElement(this.ConfirmationModal, Object.assign({
			header: title,
			confirmText: confirmText,
			cancelText: cancelText,
			onConfirm,
			onCancel
		}, props), DiscordModules.React.createElement(this.Text, null, content))
		);
	}
	static alert(title1, content1) {
		return this.showConfirmationModal(title1, content1, {
			cancelText: null
		});
	}
}

class Patcher {
	static getPatchesByCaller(id) {
		if (!id) return [];
		const patches = [];
		for (const patch of this._patches)
			for (const childPatch of patch.children)
				if (childPatch.caller === id) patches.push(childPatch);
		return patches;
	}
	static unpatchAll(caller) {
		const patches = this.getPatchesByCaller(caller);
		if (!patches.length) return;
		for (const patch of patches) patch.unpatch();
	}
	static makeOverride(patch) {
		return function() {
			var ref;
			let returnValue;
			if (!(patch === null || patch === void 0 ? void 0 : (ref = patch.children) === null || ref === void 0 ? void 0 : ref.length)) return patch.originalFunction.apply(this, arguments);
			for (const beforePatch of patch.children.filter((e) => e.type === "before"
			)) {
				try {
					beforePatch.callback(this, arguments);
				} catch (error) {
					Logger.error("Patcher", `Cannot fire before patch of ${patch.functionName} for ${beforePatch.caller}:`, error);
				}
			}
			const insteadPatches = patch.children.filter((e) => e.type === "instead"
			);
			if (!insteadPatches.length)
				returnValue = patch.originalFunction.apply(this, arguments);
			else
				for (const insteadPatch of insteadPatches) {
					try {
						const tempReturn = insteadPatch.callback(this, arguments, patch.originalFunction.bind(this));
						if (typeof tempReturn !== "undefined")
							returnValue = tempReturn;
					} catch (error) {
						Logger.error("Patcher", `Cannot fire before patch of ${patch.functionName} for ${insteadPatch.caller}:`, error);
					}
			}
			for (const afterPatch of patch.children.filter((e) => e.type === "after"
			)) {
				try {
					const tempReturn = afterPatch.callback(this, arguments, returnValue, (ret) => returnValue = ret
					);
					if (typeof tempReturn !== "undefined")
						returnValue = tempReturn;
				} catch (error) {
					Logger.error("Patcher", `Cannot fire before patch of ${patch.functionName} for ${afterPatch.caller}:`, error);
				}
			}
			return returnValue;
		};
	}
	static pushPatch(caller1, module, functionName) {
		const patch = {
			caller: caller1,
			module,
			functionName,
			originalFunction: module[functionName],
			undo: () => {
				patch.module[patch.functionName] = patch.originalFunction;
				patch.children = [];
			},
			count: 0,
			children: []
		};
		module[functionName] = this.makeOverride(patch);
		Object.assign(module[functionName], patch.originalFunction, {
			__originalFunction: patch.originalFunction
		});
		return this._patches.push(patch), patch;
	}
	static doPatch(caller2, module1, functionName1, callback, type = "after", options = {
		}) {
		let {displayName} = options;
		var ref;
		const patch = (ref = this._patches.find((e) => e.module === module1 && e.functionName === functionName1
		)) !== null && ref !== void 0 ? ref : this.pushPatch(caller2, module1, functionName1);
		if (typeof displayName !== "string") displayName || module1.displayName || module1.name || module1.constructor.displayName || module1.constructor.name;
		const child = {
			caller: caller2,
			type,
			id: patch.count,
			callback,
			unpatch: () => {
				patch.children.splice(patch.children.findIndex((cpatch) => cpatch.id === child.id && cpatch.type === type
				), 1);
				if (patch.children.length <= 0) {
					const patchNum = this._patches.findIndex((p) => p.module == module1 && p.functionName == functionName1
					);
					this._patches[patchNum].undo();
					this._patches.splice(patchNum, 1);
				}
			}
		};
		patch.children.push(child);
		patch.count++;
		return child.unpatch;
	}
	static before(caller3, module2, functionName2, callback1) {
		return this.doPatch(caller3, module2, functionName2, callback1, "before");
	}
	static after(caller4, module3, functionName3, callback2) {
		return this.doPatch(caller4, module3, functionName3, callback2, "after");
	}
	static instead(caller5, module4, functionName4, callback3) {
		return this.doPatch(caller5, module4, functionName4, callback3, "instead");
	}
}
Patcher._patches = [];

var Toasts$2 = {
	settings: [
		{
			name: "Show Toasts",
			note: "Show any types of toasts.",
			value: true,
			id: "showToasts",
			type: "switch"
		},
		{
			name: "Use builtin toasts",
			note: "Makes BDCompat use discord's builtin toasts instead.",
			value: true,
			id: "useBuiltinToasts",
			type: "switch"
		},
		{
			name: "Show Toasts on",
			type: "category",
			requires: [
				"showToasts"
			],
			items: [
				{
					name: "Show Toasts on plugin start/stop",
					id: "showToastsPluginStartStop",
					type: "switch",
					value: true
				},
				{
					name: "Show Toasts on plugin load/unload",
					id: "showToastsPluginLoad",
					type: "switch",
					value: true
				},
				{
					name: "Show Toasts on plugin reload",
					id: "showToastsPluginReload",
					type: "switch",
					value: true
				},
				{
					name: "Show Toasts on plugin enable/disable",
					id: "showToastsPluginState",
					type: "switch",
					value: true
				}
			]
		}
	]
};
var defaultSettings = {
	Toasts: Toasts$2
};

class SettingsManager {
	static get items() {
		return defaultSettings;
	}
	static initialize() {
		this.states = DataStore.getSettings();
		const loadSetting = (settings, requires = []) => {
			for (const setting of settings) {
				if (setting.type === "category") {
					loadSetting(setting.items, setting.requires);
					continue;
				}
				this.settings[setting.id] = {
					type: setting.type,
					get value() {
						var _id;
						return (_id = SettingsManager.states[setting.id]) !== null && _id !== void 0 ? _id : setting.value;
					},
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
	static setSetting(id2, value) {
		this.states[id2] = value;
		DataStore.setSettings(id2, value);
		this.alertListeners(id2, value);
	}
	static isEnabled(id1) {
		const setting = this.settings[id1];
		if (!setting) return false;
		return setting.value && setting.requires.every((id) => this.isEnabled(id)
			);
	}
	// Listener stuff
	static addListener(callback) {
		this.listeners.add(callback);
		return () => this.removeListener(callback);
	}
	static removeListener(callback1) {
		return this.listeners.delete(callback1);
	}
	static alertListeners(...args) {
		for (const callback of this.listeners) {
			try {
				callback(...args);
			} catch (error) {
				Logger.error("SettingsManager", "Could not fire listener:", error);
			}
		}
	}
	static useState(factory) {
		const [state, setState] = React.useState(factory());
		React.useEffect(() => {
			return this.addListener(() => setState(factory())
			);
		});
		return state;
	}
}
SettingsManager.listeners = new Set();
SettingsManager.defaultSettings = defaultSettings;
SettingsManager.states = {
};
SettingsManager.settings = {
};

function Toast({type, children, timeout, onRemove}) {
	const {React} = DiscordModules;
	const [closing, setClosing] = React.useState(false);
	const remove = React.useCallback(() => {
		setClosing(true);
		setTimeout(() => onRemove()
			, 300);
	}, [
		onRemove,
		closing
	]);
	React.useEffect(() => {
		setTimeout(() => remove()
			, timeout);
	}, [
		timeout
	]);
	return React.createElement("div", {
		className: [
			"bd-toast",
			type && [
				"icon",
				"toast-" + type
			],
			closing && "closing"
		].filter(Boolean).flat(10).join(" "),
		onClick: (event) => {
			if (!event.shiftKey) return;
			remove();
		}
	}, children);
}
function ToastsContainer({useStore, setState}) {
	const {React} = DiscordModules;
	const elements = useStore((state) => state.toasts
	);
	return React.createElement(React.Fragment, null, elements.map((element) => React.createElement(Toast, {
		key: element.id,
		onRemove: () => {
			setState((state) => {
				const index = state.toasts.indexOf(element);
				if (index < 0) return;
				return {
					...state,
					toasts: state.toasts.slice(0, index).concat(state.toasts.slice(index + 1))
				};
			});
		},
		children: element.content,
		timeout: element.timeout,
		type: element.type
	})
	));
}

/**
 * Creates a updateable react store with a remote api.
 * @param {Any} state Intitial State of your store
 * @returns {Any}
 */
function createStore(state) {
	const listeners = new Set();
	const Api = Object.freeze({
		get listeners() {
			return listeners;
		},
		getState(factory = (_) => _
		) {
			return factory(state);
		},
		setState(partial) {
			const partialState = typeof partial === "function" ? partial(state) : partial;
			if (_.isEqual(state, partialState)) return;
			state = Object.assign({
			}, state, partialState);
			listeners.forEach((listener) => {
				listener(state);
			});
		},
		addListener(listener) {
			if (listeners.has(listener)) return;
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		removeListener(listener) {
			return listeners.delete(listener);
		}
	});
	function useState(factory = (_) => _
	) {
		const [, forceUpdate] = DiscordModules.React.useReducer((e) => e + 1
			, 0);
		DiscordModules.React.useEffect(() => {
			const handler = () => forceUpdate();
			listeners.add(handler);
			return () => listeners.delete(handler);
		}, []);
		return Api.getState(factory);
	}
	Object.assign(useState, Api, {
		*[Symbol.iterator]() {
			yield useState;
			yield Api;
		}
	});
	return useState;
}

class Converter {
	static convertType(type1) {
		switch (
		type1 === null || type1 === void 0 ? void 0 : type1.toLowerCase()) {
			case "info":
				return DiscordModules.Toasts.ToastType.MESSAGE;
			case "error":
				return DiscordModules.Toasts.ToastType.FAILURE;
			case "success":
				return DiscordModules.Toasts.ToastType.SUCCESS;
			default:
				return DiscordModules.Toasts.ToastType.MESSAGE;
		}
	}
}
class Toasts$1 {
	static dispose() {
		return DiscordModules.ReactDOM.unmountComponentAtNode(this.container);
	}
	static get container() {
		return memoize(this, "container", () => DOM.createElement("div", {
			className: "bd-toasts"
		})
		);
	}
	static initialize() {
		const [useStore, Api] = createStore({
			toasts: []
		});
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
	static show(content1, options1 = {
		}) {
		if (!SettingsManager.isEnabled("showToasts")) return;
		if (SettingsManager.isEnabled("useBuiltinToasts")) return this.showDiscordToast(content1, options1);
		// NotLikeThis
		setImmediate(() => {
			this.API.setState((state) => ({
				...state,
				id: Math.random().toString(36).slice(2),
				toasts: state.toasts.concat({
					content: content1,
					timeout: 3000,
					...options1
				})
			})
			);
		});
	}
}

class Utilities {
	static parseMETA(code) {
		const [firstLine] = code.split("\n");
		if (firstLine.startsWith("//META")) return this.parseOldMETA(code);
		if (firstLine.startsWith("/**")) return this.parseNewMETA(code);
		throw new Error("META was not found!");
	}
	static parseOldMETA(code1) {
		const [firstLine] = code1.split("\n");
		const parsed = JSON.parse(firstLine.slice(firstLine.indexOf("//META") + 6, firstLine.indexOf("*//")));
		parsed.format = "json";
		return parsed;
	}
	static parseNewMETA(code2) {
		const block = code2.split("/**", 2)[1].split("*/", 1)[0];
		const parsed = {
			format: "jsdoc"
		};
		let key = "";
		let value = "";
		for (const line of block.split(this.metaSplitRegex)) {
			if (!line.length) continue;
			if (line[0] === "@" && line[1] !== " ") {
				parsed[key] = value;
				const index = line.indexOf(" ");
				key = line.slice(1, index);
				value = line.slice(index + 1);
			} else {
				value += ` ${line.replace("\\n", "\n").replace(this.escapeAtRegex, "@")}`;
			}
		}
		parsed[key] = value.trim();
		delete parsed[""];
		return parsed;
	}
	static joinClassNames(...classNames /* : (string | [boolean, string])[] */ ) {
		let className = [];
		for (const item of classNames) {
			if (typeof item === "string") {
				className.push(item);
				continue;
			}
			if (Array.isArray(item)) {
				const [should, name] = item;
				if (!should) continue;
				className.push(name);
			}
		}
		return className.join(" ");
	}
}
Utilities.metaSplitRegex = /[^\S\r\n]*?\r?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
Utilities.escapeAtRegex = /^\\@/;

class PluginsManager {
	static on(event, callback) {
		if (!this.listeners[event])
			this.listeners[event] = new Set();
		return this.listeners[event].add(callback), this.off.bind(this, event, callback);
	}
	static off(event1, callback1) {
		if (!this.listeners[event1]) return;
		return this.listeners[event1].delete(callback1);
	}
	static dispatch(event2, ...args) {
		if (!this.listeners[event2]) return;
		for (const listener of this.listeners[event2]) {
			try {
				listener(...args);
			} catch (error) {
				Logger.error("Emitter", error);
			}
		}
	}
	static initialize() {
		this.addonState = DataStore.getAddonState("plugins");
		this.observer = new MutationObserver((changes) => {
			for (const change of changes) this.onMutate(change);
		});
		this.observer.observe(document, {
			childList: true,
			subtree: true
		});
		BDCompatNative.IPC.on("navigate", () => this.onSwitch()
		);
		Logger.log("PluginsManager", "Loading plugins...");
		this.loadAllPlugins();
		this.watchAddons();
	}
	static watchAddons() {
		this.watcher = fs$1.watch(this.folder, {
			persistent: false
		}, (eventType, filename) => {
			if (!eventType || !filename) return;
			const absolutePath = path.resolve(this.folder, filename);
			if (!filename.endsWith(this.extension)) return;
			// await new Promise(r => setTimeout(r, 100));
			try {
				const stats = fs$1.statSync(absolutePath);
				if (!stats.isFile() || !stats.mtime) return;
				if (this.times[filename] === stats.mtime.getTime()) return;
				this.times[filename] = stats.mtime.getTime();
				if (eventType === "rename") this.loadAddon(absolutePath, true);
				if (eventType === "change") this.reloadAddon(absolutePath, true);
			} catch (err) {
				if (fs$1.existsSync(absolutePath)) return;
				this.unloadAddon(absolutePath, true);
			}
		});
	}
	static loadAllPlugins() {
		for (const filename of fs$1.readdirSync(this.folder, "utf8")) {
			const location = path.resolve(this.folder, filename);
			const stats = fs$1.statSync(location);
			if (!filename.endsWith(this.extension) || !stats.isFile()) continue;
			this.times[filename] = stats.mtime.getTime();
			try {
				this.loadAddon(location, false);
				this.dispatch("updated");
			} catch (error) {
				Logger.error("PluginsManager", `Failed to load plugin ${filename}:`, error);
			}
		}
	}
	static compile(filecontent, name, location) {
		return `(function (module, exports, __dirname, __filename, global) {
${filecontent}
if (!module.exports || !module.exports.prototype) {module.exports = eval(${JSON.stringify(name)});}
})
//# sourceURL=${_.escape(location)}`;
	}
	static resolve(idOrFileOrAddon) {
		return this.addons.find((addon) => addon.name === idOrFileOrAddon || addon.path === idOrFileOrAddon || addon === idOrFileOrAddon
		);
	}
	static loadAddon(location1, showToast = true, showStart = true) {
		const filecontent = fs$1.readFileSync(location1, "utf8");
		const meta = Utilities.parseMETA(filecontent);
		Object.assign(meta, {
			filename: path.basename(location1),
			path: location1,
			filecontent
		});
		if (this.resolve(meta.name) || this.resolve(meta.filename))
			throw new Error(`There's already a plugin with name ${meta.name || meta.filename}!`);
		let exports = {
		};
		try {
			window.eval(this.compile(filecontent, meta.name, location1))(exports, exports, path.dirname(location1), location1, window);
		} catch (error) {
			Logger.error("PluginsManager", `Failed to compile ${meta.name || path.basename(location1)}:`, error);
		}
		meta.exports = exports.toString().split(" ")[0] === "class" ? exports : exports.__esModule ? exports.default || exports.exports.default : exports.exports;
		try {
			const instance = new meta.exports(meta);
			meta.instance = instance;
			if (typeof instance.load === "function") {
				try {
					instance.load(meta);
					Logger.log("PluginsManager", `${meta.name} was loaded!`);
					if (showToast && SettingsManager.isEnabled("showToastsPluginLoad")) Toasts$1.show(`${meta.name} was loaded!`, {
							type: "success"
						});
				} catch (error) {
					Logger.error("PluginsManager", `Unable to fire load() for ${meta.name || meta.filename}:`, error);
				}
			}
			if (!meta.version && typeof instance.getVersion === "function")
				meta.version = instance.getVersion();
			if (!meta.description && typeof instance.getDescription === "function")
				meta.description = instance.getDescription();
			if (!meta.author && typeof instance.getAuthor === "function")
				meta.author = `${instance.getAuthor()}`; // Prevent clever escaping. 
			if (!(meta.name in this.addonState)) {
				this.addonState[meta.name] = false;
				DataStore.saveAddonState("plugins", this.addonState);
			}
			this.addons.push(meta);
			if (this.addonState[meta.name]) this.startPlugin(meta, showStart);
		} catch (error1) {
			Logger.error("PluginsManager", `Unable to load ${meta.name || meta.filename}:`, error1);
		}
		if (meta.instance) return meta;
	}
	static unloadAddon(idOrFileOrAddon1, showToast1 = true) {
		const addon = this.resolve(idOrFileOrAddon1);
		if (!addon) return;
		this.stopPlugin(addon, false);
		this.addons.splice(this.addons.indexOf(addon), 1);
		if (showToast1) {
			Logger.log("PluginsManager", `${addon.name} was unloaded!`);
			if (SettingsManager.isEnabled("showToastsPluginLoad")) Toasts$1.show(`${addon.name} was unloaded!`, {
					type: "info"
				});
		}
		this.dispatch("updated");
	}
	static startPlugin(plugin, showToast2 = true) {
		const addon = this.resolve(plugin);
		if (!addon) return;
		try {
			if (typeof addon.instance.start === "function") addon.instance.start();
			if (showToast2) {
				Logger.log("PluginsManager", `${addon.name} has been started!`);
				if (SettingsManager.isEnabled("showToastsPluginStartStop")) Toasts$1.show(`${addon.name} has been started!`, {
						type: "info"
					});
			}
		} catch (error) {
			Logger.error("PluginsManager", `Unable to fire start() for ${addon.name}:`, error);
			Toasts$1.show(`${addon.name} could not be started!`, {
				type: "error"
			});
			return false;
		}
		return true;
	}
	static stopPlugin(plugin1, showToast3 = true) {
		const addon = this.resolve(plugin1);
		if (!addon) return;
		try {
			if (typeof addon.instance.stop === "function") addon.instance.stop();
			if (showToast3) {
				Logger.log("PluginsManager", `${addon.name} has been stopped!`);
				if (SettingsManager.isEnabled("showToastsPluginStartStop")) Toasts$1.show(`${addon.name} has been stopped!`, {
						type: "info"
					});
			}
		} catch (error) {
			Logger.error("PluginsManager", `Unable to fire stop() for ${addon.name}:`, error);
			Toasts$1.show(`${addon.name} could not be stopped!`, {
				type: "error"
			});
			return false;
		}
		return true;
	}
	static isEnabled(idOrFileOrAddon2) {
		const addon = this.resolve(idOrFileOrAddon2);
		if (!addon) return;
		var _name;
		return (_name = this.addonState[addon.name]) !== null && _name !== void 0 ? _name : false;
	}
	static enableAddon(idOrFileOrAddon3) {
		const addon = this.resolve(idOrFileOrAddon3);
		if (!addon) return Logger.warn("PluginsManager", `Unable to enable plugin that isn't loaded!`);
		if (this.isEnabled(addon)) return Logger.warn("PluginsManager", `Cannot enable addon twice!`);
		const success = this.startPlugin(addon, false);
		if (success) {
			Logger.log("PluginsManager", `${addon.name} has been enabled!`);
			if (SettingsManager.isEnabled("showToastsPluginState")) Toasts$1.show(`${addon.name} has been enabled!`, {
					type: "info"
				});
		}
		this.addonState[addon.name] = success;
		DataStore.saveAddonState("plugins", this.addonState);
		this.dispatch("toggled", addon.name, success);
	}
	static disableAddon(idOrFileOrAddon4) {
		const addon = this.resolve(idOrFileOrAddon4);
		if (!addon) return Logger.warn("PluginsManager", `Unable to disable non-loaded addon!`);
		if (!this.isEnabled(addon)) return Logger.warn("PluginsManager", `Cannot disable addon twice!`);
		const success = this.stopPlugin(addon, false);
		if (success) {
			Logger.log("PluginsManager", `${addon.name} has been stopped!`);
			if (SettingsManager.isEnabled("showToastsPluginState")) Toasts$1.show(`${addon.name} has been stopped!`, {
					type: "info"
				});
		}
		this.addonState[addon.name] = false;
		DataStore.saveAddonState("plugins", this.addonState);
		this.dispatch("toggled", addon.name, false);
	}
	static toggleAddon(idOrFileOrAddon5) {
		const addon = this.resolve(idOrFileOrAddon5);
		if (this.isEnabled(addon)) this.disableAddon(addon);
		else this.enableAddon(addon);
	}
	static reloadAddon(idOrFileOrAddon6) {
		const addon = this.resolve(idOrFileOrAddon6);
		this.unloadAddon(addon, false);
		this.loadAddon(addon.path, false, false);
		Toasts$1.show(`${addon.name} was reloaded!`, {
			type: "success"
		});
		if (SettingsManager.isEnabled("showToastsPluginReload")) Logger.log("PluginsManager", `${addon.name} was reloaded!`);
	}
	static onSwitch() {
		for (const plugin of this.addons) {
			if (typeof plugin.instance.onSwitch !== "function" || !this.isEnabled(plugin)) continue;
			try {
				plugin.instance.onSwitch();
			} catch (error) {
				Logger.error("PluginsManager", `Unable to fire onSwitch() for ${plugin.name}:`, error);
			}
		}
	}
	static onMutate(changes) {
		for (const plugin of this.addons) {
			if (typeof plugin.instance.observer !== "function" || !this.isEnabled(plugin)) continue;
			try {
				plugin.instance.observer(changes);
			} catch (error) {
				Logger.error("PluginsManager", `Unable to fire observer() for ${plugin.name}:`, error);
			}
		}
	}
}
PluginsManager.listeners = {
};
PluginsManager.folder = DataStore.pluginsFolder;
PluginsManager.extension = ".plugin.js";
PluginsManager.addons = [];
PluginsManager.times = {
};

class ThemesManager {
	static on(event, callback) {
		if (!this.listeners[event])
			this.listeners[event] = new Set();
		return this.listeners[event].add(callback), this.off.bind(this, event, callback);
	}
	static off(event1, callback1) {
		if (!this.listeners[event1]) return;
		return this.listeners[event1].delete(callback1);
	}
	static dispatch(event2, ...args) {
		if (!this.listeners[event2]) return;
		for (const listener of this.listeners[event2]) {
			try {
				listener(...args);
			} catch (error) {
				Logger.error("Emitter", error);
			}
		}
	}
	static initialize() {
		this.addonState = DataStore.getAddonState("themes");
		Logger.log("ThemesManager", "Loading themes...");
		this.loadAllThemes();
		this.watchAddons();
	}
	static resolve(idOrFileOrAddon) {
		return this.addons.find((addon) => addon.id === idOrFileOrAddon || addon.name === idOrFileOrAddon || addon.path === idOrFileOrAddon || addon === idOrFileOrAddon
		);
	}
	static isEnabled(idOrFileOrAddon1) {
		const addon = this.resolve(idOrFileOrAddon1);
		if (!addon) return;
		var _name;
		return (_name = this.addonState[addon.name]) !== null && _name !== void 0 ? _name : false;
	}
	static watchAddons() {
		let lastCall = new Date();
		this.watcher = fs$1.watch(this.folder, {
			persistent: false
		}, (eventType, filename) => {
			if (!eventType || !filename || new Date() - lastCall < 100) return;
			lastCall = new Date();
			const absolutePath = path.resolve(this.folder, filename);
			if (!filename.endsWith(this.extension)) return;
			// await new Promise(r => setTimeout(r, 100));
			try {
				const stats = fs$1.statSync(absolutePath);
				if (!stats.isFile() || !stats.mtime) return;
				if (this.times[filename] === stats.mtime.getTime()) return;
				this.times[filename] = stats.mtime.getTime();
				if (eventType == "rename") this.loadTheme(absolutePath, true);
				if (eventType == "change") this.reloadAddon(absolutePath, true);
			} catch (err) {
				if (fs$1.existsSync(absolutePath)) return;
				this.unloadAddon(absolutePath, true);
			}
		});
	}
	static loadAllThemes() {
		for (const filename of fs$1.readdirSync(this.folder, "utf8")) {
			const location = path.resolve(this.folder, filename);
			const stats = fs$1.statSync(location);
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
		const filecontent = fs$1.readFileSync(location, "utf8");
		const meta = Utilities.parseMETA(filecontent);
		meta.filename = path.basename(location);
		meta.path = location;
		meta.css = filecontent;
		if (this.resolve(meta.name))
			throw new Error(`A theme with name ${meta.name} already exists!`);
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
	static unloadAddon(addon, showToast1 = true) {
		const theme = this.resolve(addon);
		if (!theme) return;
		this.removeTheme(theme, false);
		this.addons.splice(this.addons.indexOf(theme), 1);
		if (showToast1) {
			Logger.log("ThemesManager", `${theme.name} was unloaded!`);
			Toasts$1.show(`${theme.name} was unloaded!`, {
				type: "info"
			});
		}
		this.dispatch("updated");
	}
	static applyTheme(addon1, showToast2 = true) {
		const theme = this.resolve(addon1);
		if (!theme) return;
		theme.element = DOM.injectCSS(theme.name + "theme", theme.css);
		if (showToast2) {
			Toasts$1.show(`${theme.name} has been applied!`, {
				type: "success"
			});
			Logger.log("ThemesManager", `${theme.name} has been applied!`);
		}
	}
	static removeTheme(addon2, showToast3 = true) {
		const theme = this.resolve(addon2);
		if (!theme || !theme.element || !DOM.head.contains(theme.element)) return;
		theme.element.remove();
		delete theme.element;
		delete theme.css;
		if (showToast3) {
			Logger.log("ThemesManager", `${theme.name} has been removed!`);
			Toasts$1.show(`${theme.name} has been removed!`, {
				type: "info"
			});
		}
	}
	static reloadAddon(addon3) {
		const theme = this.resolve(addon3);
		if (!theme || !this.isEnabled(theme)) return;
		this.unloadAddon(theme, false);
		this.loadTheme(theme.path, false);
		Logger.log("ThemesManager", `${theme.name} was reloaded!`);
		Toasts$1.show(`${theme.name} was reloaded!`, {
			type: "success"
		});
	}
	static enableAddon(addon4) {
		const theme = this.resolve(addon4);
		if (!theme || this.isEnabled(theme)) return;
		this.applyTheme(theme, false);
		Logger.log("ThemesManager", `${theme.name} has been enabled!`);
		Toasts$1.show(`${theme.name} has been applied.`);
		this.addonState[theme.name] = true;
		DataStore.saveAddonState("themes", this.addonState);
		this.dispatch("toggled", theme.name, true);
	}
	static disableAddon(addon5) {
		const theme = this.resolve(addon5);
		if (!theme || !this.isEnabled(theme)) return;
		this.removeTheme(theme, false);
		Logger.log("ThemesManager", `${theme.name} has been removed!`);
		Toasts$1.show(`${theme.name} has been removed.`, {
			type: "info"
		});
		this.addonState[theme.name] = false;
		DataStore.saveAddonState("themes", this.addonState);
		this.disableAddon("toggled", theme.name, false);
	}
	static toggleAddon(addon6) {
		const theme = this.resolve(addon6);
		if (!theme) return;
		if (this.isEnabled(addon6)) this.disableAddon(addon6);
		else this.enableAddon(addon6);
	}
}
ThemesManager.folder = DataStore.themesFolder;
ThemesManager.extension = ".theme.css";
ThemesManager.listeners = {
};
ThemesManager.addons = [];
ThemesManager.times = {
};

const createAddonAPI = (manager) => new class AddonAPI {
	get folder() {
		return manager.folder;
	}
	isEnabled(idOrFile) {
		return manager.isEnabled(idOrFile);
	}
	enable(idOrAddon) {
		return manager.enableAddon(idOrAddon);
	}
	disable(idOrAddon1) {
		return manager.disableAddon(idOrAddon1);
	}
	toggle(idOrAddon2) {
		return manager.toggleAddon(idOrAddon2);
	}
	reload(idOrAddon3) {
		return manager.reloadAddon(idOrAddon3);
	}
	get(idOrFile1) {
		return manager.resolve(idOrFile1);
	}
	getAll() {
		return manager.addons.map((addon) => this.get(addon)
		);
	}
};
class BdApi {
	static get version() {
		return "0.0.0";
	}
	static get React() {
		return DiscordModules.React;
	}
	static get ReactDOM() {
		return DiscordModules.ReactDOM;
	}
	static get WindowConfigFile() {
		return "";
	}
	static get settings() {
		return [];
	}
	static isSettingEnabled() {
		return true;
	}
	static disableSetting() {}
	static enableSetting() {}
	static __getPluginConfigPath(plugin) {
		return console.log({
				plugin
			}), path.resolve(this.Plugins.folder, "..", "config", `${plugin}.json`);
	}
	static injectCSS(id, css) {
		return DOM.injectCSS(id, css);
	}
	static clearCSS(id1) {
		return DOM.clearCSS(id1);
	}
	static alert(title, content) {
		return Modals.alert(title, content);
	}
	static showConfirmationModal(title1, content1, options3) {
		return Modals.showConfirmationModal(title1, content1, options3);
	}
	static showToast(content2, options1) {
		return Toasts$1.show(content2, options1);
	}
	static findModule(filter) {
		return Webpack.findModule(filter);
	}
	static findAllModules(filter1) {
		return Webpack.findModules(filter1);
	}
	static findModuleByProps(...props) {
		return Webpack.findByProps(...props);
	}
	static findModuleByDisplayName(displayName) {
		return Webpack.findByDisplayName(displayName);
	}
	static findModuleByPrototypes(...protos) {
		return Webpack.findModule((m) => typeof m === "function" && protos.every((proto) => proto in m.prototype
		)
		);
	}
	static getInternalInstance(node) {
		return node === null || node === void 0 ? void 0 : node.__reactFiber$;
	}
	static suppressErrors(method, message) {
		return (...args) => {
			try {
				return method(...args);
			} catch (error) {
				Logger.error("SuppressErrors", message, error);
			}
		};
	}
	static testJSON(json) {
		try {
			return JSON.parse(json);
		} catch (e) {
			return false;
		}
	}
	static loadData(pluginName, key3) {
		return DataStore.getPluginData(pluginName, key3);
	}
	static saveData(pluginName1, key1, value) {
		return DataStore.setPluginData(pluginName1, key1, value);
	}
	static deleteData(pluginName2, key2) {
		return DataStore.deletePluginData(pluginName2, key2);
	}
	static get getData() {
		return this.loadData;
	}
	static get setData() {
		return this.saveData;
	}
	static monkeyPatch(module1, functionName1, options2) {
		const {before, after, instead, once =false} = options2;
		const patches = [];
		const makePatch = (type, callback) => {
			const data = {
				originalMethod: module1[functionName1],
				callOriginalMethod: () => Reflect.apply(data.originalMethod, data.thisObject, data.methodArguments)
			};
			patches.push(data.cancelPatch = Patcher[type]("BDCompatPatch-monkeyPatch", module1, functionName1, (_this, args, rest) => {
				data.thisObject = _this;
				data.methodArguments = args;
				data.returnValue = rest;
				try {
					const tempRet = Reflect.apply(callback, null, [
						data
					]);
					if (once) data.cancelPatch();
					return tempRet;
				} catch (error) {
					Logger.error(`BdApi.monkeyPatch`, `Error in the ${type} callback of ${functionName1}:`, error);
				}
			}));
		};
		if (typeof before === "function") makePatch("before", before);
		if (typeof after === "function") makePatch("after", after);
		if (typeof instead === "function") makePatch("instead", instead);
		return () => {
			for (const patch of patches) patch();
		};
	}
	static onRemoved(node1, callback1) {
		return new MutationObserver((changes, observer) => {
			for (const change of changes) {
				for (const removed of change.removedNodes) {
					if (removed === node1) {
						observer.disconnect();
						callback1();
					} else if (removed.contains(node1)) {
						observer.disconnect();
						callback1();
					}
				}
			}
		}).observe(document, {
			childList: true,
			subtree: true
		});
	}
}
BdApi.Plugins = createAddonAPI(PluginsManager);
BdApi.Themes = createAddonAPI(ThemesManager);
BdApi.Patcher = {
	patch(caller, module, functionName, callback, options) {
		if (typeof caller !== "string") return Logger.error("BdApi.Patcher", `Parameter 0 of patch must be a string representing the caller`);
		if ([
				"after",
				"before",
				"instead"
			].includes(options.type)) return Logger.error("BdApi.Patcher", `options.type must be one of (before | after | instead). Received ${options.type}.`);
		return Patcher[options.type](caller, module, functionName, callback);
	},
	getPatchesByCaller(caller) {
		if (typeof caller !== "string") return Logger.error("BDCompat", `Argument "caller" must be a typeof string. Received ${typeof caller} instead`);
		return Patcher.getPatchesByCaller(caller);
	},
	unpatchAll(caller) {
		if (typeof caller !== "string") return Logger.error("BDCompat", `Argument "caller" must be a typeof string. Received ${typeof caller} instead`);
		return Patcher.unpatchAll(caller);
	},
	...Object.fromEntries([
				"before",
				"after",
				"instead"
	].map((type) => [
				type,
				function(caller, module, functionName, callback) {
							return Patcher[type](caller, module, functionName, callback);
				}
	]
	))
};
Object.defineProperties(BdApi, Reflect.ownKeys(BdApi).slice(2).reduce((descriptors, key) => {
	descriptors[key] = Object.assign({
	}, Object.getOwnPropertyDescriptor(BdApi, key), {
		enumerable: true
	});
	return descriptors;
}, {
}));

var electron = {
	shell: BDCompatNative.executeJS(`require("electron").shell`, new Error().stack),
	clipboard: BDCompatNative.executeJS(`require("electron").clipboard`, new Error().stack),
	ipcRenderer: BDCompatNative.executeJS(`Object.keys(require("electron").ipcRenderer)`, new Error().stack).slice(3).reduce((newElectron, key) => {
		newElectron[key] = BDCompatNative.executeJS(`require("electron").ipcRenderer[${JSON.stringify(key)}].bind(require("electron").ipcRenderer)`, new Error().stack);
		return newElectron;
	}, {
	})
};

class EventEmitter {
	static get EventEmitter() {
		return EventEmitter;
	}
	setMaxListeners() {}
	on(event, callback) {
		if (!this.events[event])
			this.events[event] = new Set();
		this.events[event].add(callback);
	}
	emit(event1, ...args) {
		if (!this.events[event1]) return;
		for (const [index, listener] of this.events[event1].entries()) {
			try {
				listener(...args);
			} catch (error) {
				Logger.error("Emitter", `Cannot fire listener for event ${event1} at position ${index}:`, error);
			}
		}
	}
	off(event2, callback1) {
		if (!this.events[event2]) return;
		return this.events[event2].delete(callback1);
	}
	constructor() {
		this.events = {
		};
	}
}

const request$1 = function(url, options, callback, method = "") {
	if (typeof options === "function") {
		callback = options;
	}
	const eventName = "request-" + Math.random().toString(36).slice(2, 10);
	BDCompatNative.IPC.once(eventName, (error, res, body) => {
		res = JSON.parse(res);
		const resp = new Response(body, res);
		Object.defineProperties(resp, {
			url: {
				value: url
			},
			type: {
				value: method.toLowerCase() || "default"
			},
			headers: {
				value: Object.fromEntries(Array.from(resp.headers))
			}
		});
		Object.assign(resp, _.omit(res, "body", "headers", "ok", "status"));
		callback(error, resp, body);
	});
	return BDCompatNative.executeJS(`
        const request = require("request");
        const method = "${method}";

        (method ? request[method] : request)("${url}", ${JSON.stringify(options)}, (error, res, body) => {
            BDCompatNative.IPC.dispatch("${eventName}", error, JSON.stringify(res), body);   
            delete BDCompatEvents["${eventName}"]; // No memory leak    
        });
    `, new Error().stack);
};
Object.assign(request$1, Object.fromEntries([
	"get",
	"put",
	"post",
	"delete",
	"head"
].map((method) => [
	method,
	function(url, options, callback) {
		return request$1(url, options, callback, method);
	}
]
)));

function get(url, options, res) {
	if (typeof options === "function") {
		res = options;
		options = {
		};
	}
	const id = "HTTPS_GET_" + Math.random().toString(36).slice(2);
	const emitter = new EventEmitter();
	BDCompatNative.IPC.on(id, (event, ...args) => {
		if (event === "__data") {
			return Object.assign(emitter, ...args);
		}
		if (args[0] instanceof Uint8Array) {
			args[0].toString = () => String.fromCharCode(...args[0])
			;
		}
		if (event === "end") {
			Object.assign(emitter, args[0]);
		}
		emitter.emit(event, ...args);
	});
	Object.assign(emitter, {
		end: () => void 0
	});
	BDCompatNative.executeJS(`
        require("https").get(${JSON.stringify(url)}, ${JSON.stringify(options)}, (res) => {
            for (const event of ["end", "data", "close"]) {
                res.on(event, (...args) => {
                    if (event === "end") {
                        args.push(Object.fromEntries(["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders", "end"].map(e => [e, res[e]])));
                    }

                    BDCompatNative.IPC.dispatch(${JSON.stringify(id)}, event, ...args);

                    if (event === "close") {
                        delete BDCompatEvents[${JSON.stringify(id)}];
                    }
                });
            }
        });
    `, new Error().stack);
	return res(emitter), emitter;
}
function request() {
	return Reflect.apply(get, this, arguments);
}
function createServer() {
	return DiscordNative.nativeModules.requireModule("discord_rpc").RPCWebSocket.http.createServer.apply(this, arguments);
}

var https = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	get: get,
	request: request,
	createServer: createServer
});

var mimeTypes = BDCompatNative.executeJS(`require("mime-types")`, new Error().stack);

var url = {
	parse: (...args) => BDCompatNative.executeJS(`
        __cloneObject(require("url").parse(${args.map((e) => JSON.stringify(e)
	).join(", ")}));
    `, new Error().stack)
};

function Require(mod) {
	switch (mod) {
		case "fs":
			return fs$1;
		case "path":
			return path;
		case "request":
			return request$1;
		case "process":
			return process;
		case "electron":
			return electron;
		case "events":
			return EventEmitter;
		case "http":
		case "https":
			return https;
		case "mime-types":
			return mimeTypes;
		case "url":
			return url;
		default:
			console.warn(`${mod} was not found!`);
	}
}

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
	if (receiver !== classConstructor) {
		throw new TypeError("Private static access of wrong provenance");
	}
	return descriptor.value;
}
class Components {
	static byProps(...props) {
		const name = props.join(":");
		if (_classStaticPrivateFieldSpecGet(this, Components, _cache)[name]) return _classStaticPrivateFieldSpecGet(this, Components, _cache)[name];
		_classStaticPrivateFieldSpecGet(this, Components, _cache)[name] = Webpack.findModule((m) => props.every((p) => p in m
			) && typeof m === "function"
		);
		return _classStaticPrivateFieldSpecGet(this, Components, _cache)[name];
	}
	static get(name, filter1 = (_) => _
	) {
		if (_classStaticPrivateFieldSpecGet(this, Components, _cache)[name]) return _classStaticPrivateFieldSpecGet(this, Components, _cache)[name];
		_classStaticPrivateFieldSpecGet(this, Components, _cache)[name] = Webpack.findModule((m) => m.displayName === name && filter1(m)
		);
		return _classStaticPrivateFieldSpecGet(this, Components, _cache)[name];
	}
	static bulk(id, ...filters) {
		if (_classStaticPrivateFieldSpecGet(this, Components, _cache)[id]) return _classStaticPrivateFieldSpecGet(this, Components, _cache)[id];
		_classStaticPrivateFieldSpecGet(this, Components, _cache)[id] = Webpack.bulk(...filters.map((filter) => {
			if (typeof filter === "string") return (m) => m.displayName === filter && typeof m === "function";
			if (Array.isArray(filter)) return (m) => filter.every((p) => p in m
				);
			return filter;
		}));
		return _classStaticPrivateFieldSpecGet(this, Components, _cache)[id];
	}
}
var _cache = {
	writable: true,
	value: {
	}
};

function _extends$a() {
	_extends$a = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$a.apply(this, arguments);
}
function ColorPalette(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$a({
		xmlns: "http://www.w3.org/2000/svg",
		height: "16",
		viewBox: "0 0 24 24",
		width: "16",
		fill: "currentColor"
	}, props), /*#__PURE__*/ React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), /*#__PURE__*/ React.createElement("path", {
		d: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
	})));
}

function _extends$9() {
	_extends$9 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$9.apply(this, arguments);
}
function Extension(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$9({
		xmlns: "http://www.w3.org/2000/svg",
		height: "16",
		viewBox: "0 0 24 24",
		width: "16",
		fill: "currentColor"
	}, props), /*#__PURE__*/ React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), /*#__PURE__*/ React.createElement("path", {
		d: "M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"
	})));
}

function _extends$8() {
	_extends$8 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$8.apply(this, arguments);
}
function Globe(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$8({
		xmlns: "http://www.w3.org/2000/svg",
		height: "24",
		viewBox: "0 0 24 24",
		width: "24",
		fill: "currentColor"
	}, props), /*#__PURE__*/ React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), /*#__PURE__*/ React.createElement("path", {
		d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"
	})));
}

function _extends$7() {
	_extends$7 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$7.apply(this, arguments);
}
function Github(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$7({
		width: "24",
		height: "24",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 496 512"
	}, props), /*#__PURE__*/ React.createElement("path", {
		fill: "currentColor",
		d: "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
	})));
}

function _extends$6() {
	_extends$6 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$6.apply(this, arguments);
}
function Help(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$6({
		xmlns: "http://www.w3.org/2000/svg",
		height: "24",
		viewBox: "0 0 24 24",
		width: "24",
		fill: "currentColor"
	}, props), /*#__PURE__*/ React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), /*#__PURE__*/ React.createElement("path", {
		d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
	})));
}

function _extends$5() {
	_extends$5 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$5.apply(this, arguments);
}
function Donate(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$5({
		xmlns: "http://www.w3.org/2000/svg",
		height: "24",
		viewBox: "0 0 24 24",
		width: "24",
		fill: "currentColor"
	}, props), /*#__PURE__*/ React.createElement("g", null, /*#__PURE__*/ React.createElement("rect", {
		fill: "none",
		height: "24",
		width: "24"
	})), /*#__PURE__*/ React.createElement("g", null, /*#__PURE__*/ React.createElement("path", {
		d: "M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12.88,17.76V19h-1.75v-1.29 c-0.74-0.18-2.39-0.77-3.02-2.96l1.65-0.67c0.06,0.22,0.58,2.09,2.4,2.09c0.93,0,1.98-0.48,1.98-1.61c0-0.96-0.7-1.46-2.28-2.03 c-1.1-0.39-3.35-1.03-3.35-3.31c0-0.1,0.01-2.4,2.62-2.96V5h1.75v1.24c1.84,0.32,2.51,1.79,2.66,2.23l-1.58,0.67 c-0.11-0.35-0.59-1.34-1.9-1.34c-0.7,0-1.81,0.37-1.81,1.39c0,0.95,0.86,1.31,2.64,1.9c2.4,0.83,3.01,2.05,3.01,3.45 C15.9,17.17,13.4,17.67,12.88,17.76z"
	}))));
}

function _extends$4() {
	_extends$4 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$4.apply(this, arguments);
}
function Patreon(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$4({
		width: "24",
		height: "24",
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 512 512"
	}, props), /*#__PURE__*/ React.createElement("path", {
		fill: "currentColor",
		d: "M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z"
	})));
}

const [useUpdaterStore, UpdaterApi] = createStore({
	updates: {
	}
});

function _extends$3() {
	_extends$3 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$3.apply(this, arguments);
}
function Icon1({name, ...props}) {
	const Component = Components.get(name);
	if (!Components) return null;
	return React.createElement(Component, props);
}
function ToolButton({label, icon, onClick, danger =false, disabled =false}) {
	const Button = Components.byProps("DropdownSizes");
	return React.createElement(Components.get("Tooltip"), {
		text: label,
		position: "top"
	}, (props) => React.createElement(Button, {
		...props,
		className: Utilities.joinClassNames("bd-toolbutton", [
			danger,
			"bd-danger"
		]),
		look: Button.Looks.BLANK,
		size: Button.Sizes.NONE,
		onClick: onClick,
		disabled
	}, React.createElement(Icon1, {
		name: icon,
		width: 20,
		height: 20
	}))
	);
}
function ButtonWrapper({value, onChange, disabled =false}) {
	const {React} = DiscordModules;
	const [isChecked, setChecked] = React.useState(value);
	return React.createElement(Components.get("Switch"), {
		checked: isChecked,
		disabled,
		onChange: () => {
			onChange(!isChecked);
			setChecked(!isChecked);
		}
	});
}
function ClickableName({addon}) {
	var ref;
	const isLink = React.useMemo(() => {
		return addon.authorId != null || addon.authorLink != null;
	}, [
		addon
	]);
	const Tag = isLink ? "a" : "span";
	const handleClick = function() {
		if (addon.authorId) {
			return DiscordModules.PrivateChannelActions.ensurePrivateChannel(addon.authorId).then(() => {
				DiscordModules.PrivateChannelActions.openPrivateChannel(addon.authorId);
			}).catch(() => {});
		} else {
			window.open(addon.authorLink, "_blank");
		}
	};
	var ref1;
	return ( /*#__PURE__*/ React.createElement("div", {
		className: "bd-addon-author"
	}, /*#__PURE__*/ React.createElement("span", {
		className: "bd-author-text"
	}, " by "), (ref1 = (ref = addon.author) === null || ref === void 0 ? void 0 : ref.split(/\s?,\s?/).map((author, index, authors) => /*#__PURE__*/ React.createElement(React.Fragment, {
		key: author
	}, /*#__PURE__*/ React.createElement(Tag, {
		className: "bd-link",
		onClick: handleClick
	}, author), index < authors.length - 1 && /*#__PURE__*/ React.createElement("span", {
			className: "bd-comma"
		}, ", "))
	)) !== null && ref1 !== void 0 ? ref1 : "Unknown"));
}
const IconsMap = {
	website: {
		icon: Globe,
		label: "Website"
	},
	source: {
		icon: Github,
		label: "Source"
	},
	invite: {
		icon: Help,
		label: "Support Server"
	},
	donate: {
		icon: Donate,
		label: "Donate"
	},
	patreon: {
		icon: Patreon,
		label: "Patreon"
	}
};
function SupportIcons({addon}) {
	const Button = Components.byProps("DropdownSizes");
	const openSupportServer = async function() {
		console.log("open?");
		try {
			const data = await DiscordModules.InviteActions.resolveInvite(addon.invite);
			console.log({
				data
			});
			DiscordModules.Dispatcher.dispatch({
				type: "INVITE_MODAL_OPEN",
				code: addon.invite,
				invite: data,
				context: "APP"
			});
		} catch (error) {
			Logger.error("InviteManager", `Failed to resolve invite for ${addon.name}:`, error);
			Toasts$1.show("Could not resolve invite.", {
				type: "error"
			});
		}
	};
	return ( /*#__PURE__*/ React.createElement(React.Fragment, null, Object.entries(IconsMap).map(([type, props1]) => {
		if (!addon[type]) return null;
		const {icon: Icon, label} = props1;
		const handleClick = function() {
			window.open(addon[type]);
		};
		return ( /*#__PURE__*/ React.createElement(DiscordModules.Tooltips.default, {
			text: label,
			position: "top",
			key: type
		}, (props) => /*#__PURE__*/ React.createElement(Button, _extends$3({
		}, props, {
			look: Button.Looks.BLANK,
			size: Button.Sizes.NONE,
			onClick: type === "invite" ? openSupportServer : handleClick,
			className: "bd-addon-support-button"
		}), /*#__PURE__*/ React.createElement(Icon, {
			width: "20",
			height: "20"
		}))
		));
	})));
}
function AddonCard({addon, manager, openSettings, hasSettings, type}) {
	const {React: React1} = DiscordModules;
	const [, forceUpdate] = React1.useReducer((n) => n + 1
		, 0);
	const Markdown = Components.get("Markdown", (e) => "rules" in e
	);
	const pendingUpdate = useUpdaterStore((s) => s.updates[addon.name]
	);
	React1.useEffect(() => {
		return manager.on("toggled", (name) => {
			if (name !== addon.name) return;
			forceUpdate();
		});
	}, [
		addon,
		manager
	]);
	var _name,
		_version,
		_description;
	return ( /*#__PURE__*/ React.createElement("div", {
		className: Utilities.joinClassNames("bd-addon-card"),
		"data-addon": addon.name
	}, /*#__PURE__*/ React.createElement("div", {
		className: "bd-addoncard-header"
	}, /*#__PURE__*/ React.createElement("div", {
		className: "bd-addoncard-info"
	}, /*#__PURE__*/ React.createElement("div", {
		className: "bd-addoncard-icon"
	}, type === "theme" ? /*#__PURE__*/ React.createElement(ColorPalette, null) : /*#__PURE__*/ React.createElement(Extension, null)), /*#__PURE__*/ React.createElement("div", {
		className: "bd-addon-name"
	}, (_name = addon.name) !== null && _name !== void 0 ? _name : "???"), /*#__PURE__*/ React.createElement("span", {
		className: "bd-addon-version"
	}, "v" + ((_version = addon.version) !== null && _version !== void 0 ? _version : "Unknown")), /*#__PURE__*/ React.createElement(ClickableName, {
		addon: addon
	})), /*#__PURE__*/ React.createElement(ButtonWrapper, {
		value: manager.isEnabled(addon),
		onChange: () => {
			manager.toggleAddon(addon);
		}
	})), /*#__PURE__*/ React.createElement("div", {
		className: "bd-addon-description"
	}, /*#__PURE__*/ React.createElement(Markdown, null, (_description = addon.description) !== null && _description !== void 0 ? _description : `This ${type} has no description specified.`)), /*#__PURE__*/ React.createElement("div", {
		className: "bd-addon-footer"
	}, /*#__PURE__*/ React.createElement("div", {
		className: "bd-support-bar"
	}, /*#__PURE__*/ React.createElement(SupportIcons, {
		addon: addon
	})), /*#__PURE__*/ React.createElement("div", {
		className: "bd-toolbar"
	}, pendingUpdate && /*#__PURE__*/ React.createElement(ToolButton, {
			label: "Download Update",
			icon: "Download",
			onClick: () => pendingUpdate.update()
		}), /*#__PURE__*/ React.createElement(ToolButton, {
			label: "Settings",
			icon: "Gear",
			disabled: !hasSettings || !manager.isEnabled(addon),
			onClick: openSettings
		}), /*#__PURE__*/ React.createElement(ToolButton, {
			label: "Reload",
			icon: "Replay",
			onClick: () => manager.reloadAddon(addon)
		}), /*#__PURE__*/ React.createElement(ToolButton, {
			label: "Open Path",
			icon: "Folder",
			onClick: () => {
				BDCompatNative.executeJS(`require("electron").shell.showItemInFolder(${JSON.stringify(addon.path)})`, new Error().stack);
			}
		}), /*#__PURE__*/ React.createElement(ToolButton, {
			danger: true,
			label: "Delete",
			icon: "Trash",
			onClick: () => {
				Modals.showConfirmationModal("Are you sure?", `Are you sure that you want to delete the ${type} "${addon.name}"?`, {
					onConfirm: () => {
						BDCompatNative.executeJS(`require("electron").shell.trashItem(${JSON.stringify(addon.path)})`, new Error().stack);
					}
				});
			}
		})))));
}

function DOMWrapper({children}) {
	const ref = DiscordModules.React.useRef();
	DiscordModules.React.useEffect(() => {
		if (!ref.current) return;
		ref.current.appendChild(children);
	}, [
		ref,
		children
	]);
	return DiscordModules.React.createElement("div", {
		className: "react-wrapper",
		ref
	});
}

var ErrorBoundary = (() => {
	class ErrorBoundary extends React.Component {
		static getDerivedStateFromError(error) {
			return {
				hasError: true
			};
		}
		componentDidCatch(error1, errorInfo) {
			console.error(error1, errorInfo);
		}
		render() {
			if (this.state.hasError) {
				return DiscordModules.React.createElement("span", {
					style: {
						color: "red"
					}
				}, "There was an error.");
			}
			return this.props.children;
		}
		constructor(props) {
			super(props);
			this.state = {
				hasError: false
			};
		}
	}
	return ErrorBoundary;
});

function AddonPanel({type, manager}) {
	const {React} = DiscordModules;
	const [, forceUpdate] = React.useReducer((n) => n + 1
		, 0);
	const [pluginSettings, setPluginSettings] = React.useState(null);
	const Button = Components.byProps("DropdownSizes");
	const Caret = Components.get("Caret");
	const FormNotice = Components.get("FormNotice");
	const pendingUpdates = useUpdaterStore((s) => Object.keys(s.updates)
	);
	const formatter = new Intl.ListFormat(document.documentElement.lang, {
		style: "long",
		type: "conjunction"
	});
	React.useEffect(() => manager.on("updated", () => forceUpdate()
	)
		, [
			type,
			manager,
			pluginSettings,
			forceUpdate
		]);
	return React.createElement("div", {
		className: "bdcompat-addon-panel type-" + type,
		children: [
			React.createElement("div", {
				className: "bdcompat-title",
				children: [
					pluginSettings && React.createElement(Button, {
						size: Button.Sizes.NONE,
						look: Button.Looks.BLANK,
						onClick: () => setPluginSettings(null)
					}, React.createElement(Components.get("Arrow"), {
						direction: "LEFT"
					})),
					React.createElement("span", {
						className: "bdcompat-FlexCenter",
						children: [
							`${type[0].toUpperCase() + type.slice(1)}s - ${manager.addons.length}`,
							pluginSettings && React.createElement("span", {
								className: "bdcompat-FlexCenter",
								children: [
									React.createElement(Caret, {
										direction: Caret.Directions.RIGHT,
										className: "bdcompat-settings-caret"
									}),
									pluginSettings.name
								]
							})
						]
					}),
					!pluginSettings && React.createElement(ToolButton, {
						label: "Open Folder",
						icon: "Folder",
						onClick: () => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`, new Error().stack)
					})
				]
			}),
			pluginSettings ? React.createElement(ErrorBoundary(), {
				children: pluginSettings.element
			}) : React.createElement("div", {
				className: "bdcompat-addon-panel-list"
			}, [
				pendingUpdates.length ? React.createElement(FormNotice, {
					key: "update-notice",
					type: FormNotice.Types.BRAND,
					className: "marginBottom20",
					title: `Outdated ${type[0].toUpperCase() + type.slice(1)}${pendingUpdates.length > 1 ? "s" : ""}`,
					imageData: {
						src: "/assets/6e97f6643e7df29b26571d96430e92f4.svg",
						width: 60,
						height: 60
					},
					body: React.createElement(React.Fragment, {
						children: [
							`The following ${type}${pendingUpdates.length > 1 ? "s" : ""} need to be updated:`,
							React.createElement("br"),
							formatter.format(pendingUpdates)
						]
					})
				}) : null,
				manager.addons.map((addon) => {
					var ref;
					return React.createElement(AddonCard, {
						addon,
						manager,
						type,
						key: addon.name,
						hasSettings: typeof ((ref = addon.instance) === null || ref === void 0 ? void 0 : ref.getSettingsPanel) === "function",
						openSettings: () => {
							let element;
							try {
								element = addon.instance.getSettingsPanel.apply(addon.instance, []);
							} catch (error) {
								Logger.error("Modals", `Cannot show addon settings modal for ${addon.name}:`, error);
								return void Toasts.show(`Unable to open settings panel for ${addon.name}.`, {
									type: "error"
								});
							}
							if (Element.prototype.isPrototypeOf(element))
								element = React.createElement(DOMWrapper, {
								}, element);
							else if (typeof element === "function")
								element = React.createElement(element, {
								});
							// Bruh
							if (!element) {
								Logger.error("Modals", `Unable to find settings panel for ${addon.name}`);
								return void Toasts.show(`Unable to open settings panel for ${addon.name}.`, {
									type: "error"
								});
							}
							if (!element) return;
							setPluginSettings({
								name: addon.name,
								element
							});
						}
					});
				})
			])
		]
	});
}

function _extends$2() {
	_extends$2 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$2.apply(this, arguments);
}
function SwitchItem({id, name, ...props}) {
	const SwitchForm = Components.get("SwitchItem");
	const value = SettingsManager.useState(() => SettingsManager.isEnabled(id)
	);
	return ( /*#__PURE__*/ React.createElement(SwitchForm, _extends$2({
	}, props, {
		value: value,
		onChange: () => {
			SettingsManager.setSetting(id, !value);
		}
	}), name));
}
function renderItems(items) {
	return items.map((item, i) => {
		switch (item.type) {
			case "category":
				return React.createElement(Category, Object.assign({
				}, item, {
					key: "category-" + i
				}));
			case "switch":
				return React.createElement(SwitchItem, Object.assign({
				}, item, {
					key: item.id
				}));
			default:
				return null;
		}
	});
}
function Category({name, requires, items}) {
	const [opened, setOpened] = React.useState(false);
	const [FormTitle, Caret] = Components.bulk("CategoryComponent", "FormTitle", "Caret");
	const isDisabled = SettingsManager.useState(() => !requires.every((id) => SettingsManager.isEnabled(id)
	)
	);
	const isOpened = React.useMemo(() => opened && !isDisabled
		, [
			isDisabled,
			opened
		]);
	return ( /*#__PURE__*/ React.createElement("div", {
		className: Utilities.joinClassNames("bd-category", [
			isOpened,
			"bd-category-opened"
		], [
			isDisabled,
			"bd-category-disabled"
		])
	}, /*#__PURE__*/ React.createElement("div", {
		className: "bd-category-header",
		onClick: () => setOpened(!opened)
	}, /*#__PURE__*/ React.createElement(FormTitle, {
		tag: FormTitle.Tags.H3
	}, name), /*#__PURE__*/ React.createElement(Caret, {
		className: "bd-caret",
		direction: isOpened ? Caret.Directions.DOWN : Caret.Directions.LEFT
	})), /*#__PURE__*/ React.createElement("div", {
		className: "bd-category-body"
	}, isOpened && renderItems(items))));
}
function SettingsPanel() {
	const [ChannelCategory, FormTitle] = Components.bulk("SettingsPanel", "ChannelCategory", "FormTitle");
	return DiscordModules.React.createElement("div", {
		className: "bdcompat-settings-panel",
		children: [
			DiscordModules.React.createElement("div", {
				className: "bdcompat-title"
			}, "Settings"),
			Object.entries(SettingsManager.items).map(([collection, {settings}]) => {
				return [
						/*#__PURE__*/ React.createElement(FormTitle, {
						className: "bd-collection-title",
						tag: FormTitle.Tags.H2,
						key: "title-" + collection
					}, /*#__PURE__*/ React.createElement(ChannelCategory, {
						color: "var(--text-muted)"
					}), collection),
					...renderItems(settings)
				];
			})
		]
	});
}

const module = {
	exports: {
	}
};
	/*! For license information please see main.js.LICENSE.txt */ (() => {
	var t1 = {
			742: (t2, e2) => {
				e2.byteLength = function(t) {
					var e = u1(t),
						r = e[0],
						n = e[1];
					return 3 * (r + n) / 4 - n;
				}, e2.toByteArray = function(t) {
					var e3,
						r3,
						i = u1(t),
						f = i[0],
						s = i[1],
						h = new o1(function(t, e, r) {
							return 3 * (e + r) / 4 - r;
						}(0, f, s)),
						a = 0,
						c = s > 0 ? f - 4 : f;
					for (r3 = 0; r3 < c; r3 += 4) e3 = n2[t.charCodeAt(r3)] << 18 | n2[t.charCodeAt(r3 + 1)] << 12 | n2[t.charCodeAt(r3 + 2)] << 6 | n2[t.charCodeAt(r3 + 3)], h[a++] = e3 >> 16 & 255, h[a++] = e3 >> 8 & 255, h[a++] = 255 & e3;
					return 2 === s && (e3 = n2[t.charCodeAt(r3)] << 2 | n2[t.charCodeAt(r3 + 1)] >> 4, h[a++] = 255 & e3), 1 === s && (e3 = n2[t.charCodeAt(r3)] << 10 | n2[t.charCodeAt(r3 + 1)] << 4 | n2[t.charCodeAt(r3 + 2)] >> 2, h[a++] = e3 >> 8 & 255, h[a++] = 255 & e3), h;
				}, e2.fromByteArray = function(t) {
					for (var e, n = t.length, o = n % 3, i = [], f = 16383, s = 0, u = n - o; s < u; s += f) i.push(h1(t, s, s + f > u ? u : s + f));
					return 1 === o ? (e = t[n - 1], i.push(r2[e >> 2] + r2[e << 4 & 63] + "==")) : 2 === o && (e = (t[n - 2] << 8) + t[n - 1], i.push(r2[e >> 10] + r2[e >> 4 & 63] + r2[e << 2 & 63] + "=")), i.join("");
				};
				for (var r2 = [], n2 = [], o1 = "undefined" != typeof Uint8Array ? Uint8Array : Array, i1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", f1 = 0, s1 = i1.length; f1 < s1; ++f1) r2[f1] = i1[f1], n2[i1.charCodeAt(f1)] = f1;
				function u1(t) {
					var e = t.length;
					if (e % 4 > 0)
						throw new Error("Invalid string. Length must be a multiple of 4");
					var r = t.indexOf("=");
					return -1 === r && (r = e), [
							r,
							r === e ? 0 : 4 - r % 4
						];
				}
				function h1(t, e, n) {
					for (var o, i, f = [], s = e; s < n; s += 3) o = (t[s] << 16 & 16711680) + (t[s + 1] << 8 & 65280) + (255 & t[s + 2]), f.push(r2[(i = o) >> 18 & 63] + r2[i >> 12 & 63] + r2[i >> 6 & 63] + r2[63 & i]);
					return f.join("");
				}
				n2["-".charCodeAt(0)] = 62, n2["_".charCodeAt(0)] = 63;
			},
			764: (t3, e4, r4) => {
				const n3 = r4(742),
					o2 = r4(645),
					i2 = "function" == typeof Symbol && "function" == typeof Symbol.for ? Symbol.for("nodejs.util.inspect.custom") : null;
				e4.Buffer = u2, e4.SlowBuffer = function(t) {
					return +t != t && (t = 0), u2.alloc(+t);
				}, e4.INSPECT_MAX_BYTES = 50;
				const f2 = 2147483647;
				function s2(t) {
					if (t > f2)
						throw new RangeError("The value \"" + t + "\" is invalid for option \"size\"");
					const e = new Uint8Array(t);
					return Object.setPrototypeOf(e, u2.prototype), e;
				}
				function u2(t, e, r) {
					if ("number" == typeof t) {
						if ("string" == typeof e)
							throw new TypeError("The \"string\" argument must be of type string. Received type number");
						return c(t);
					}
					return h2(t, e, r);
				}
				function h2(t4, e5, r5) {
					if ("string" == typeof t4) return (function(t, e) {
							if ("string" == typeof e && "" !== e || (e = "utf8"), !u2.isEncoding(e))
								throw new TypeError("Unknown encoding: " + e);
							const r = 0 | g(t, e);
							let n = s2(r);
							const o = n.write(t, e);
							return o !== r && (n = n.slice(0, o)), n;
						})(t4, e5);
					if (ArrayBuffer.isView(t4)) return (function(t) {
							if (J(t, Uint8Array)) {
								const e = new Uint8Array(t);
								return l(e.buffer, e.byteOffset, e.byteLength);
							}
							return p(t);
						})(t4);
					if (null == t4)
						throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof t4);
					if (J(t4, ArrayBuffer) || t4 && J(t4.buffer, ArrayBuffer)) return l(t4, e5, r5);
					if ("undefined" != typeof SharedArrayBuffer && (J(t4, SharedArrayBuffer) || t4 && J(t4.buffer, SharedArrayBuffer))) return l(t4, e5, r5);
					if ("number" == typeof t4)
						throw new TypeError("The \"value\" argument must not be of type number. Received type number");
					const n4 = t4.valueOf && t4.valueOf();
					if (null != n4 && n4 !== t4) return u2.from(n4, e5, r5);
					const o3 = function(t) {
						if (u2.isBuffer(t)) {
							const e = 0 | y(t.length),
								r = s2(e);
							return 0 === r.length || t.copy(r, 0, 0, e), r;
						}
						return void 0 !== t.length ? "number" != typeof t.length || Z(t.length) ? s2(0) : p(t) : "Buffer" === t.type && Array.isArray(t.data) ? p(t.data) : void 0;
					}(t4);
					if (o3) return o3;
					if ("undefined" != typeof Symbol && null != Symbol.toPrimitive && "function" == typeof t4[Symbol.toPrimitive]) return u2.from(t4[Symbol.toPrimitive]("string"), e5, r5);
					throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof t4);
				}
				function a1(t) {
					if ("number" != typeof t)
						throw new TypeError("\"size\" argument must be of type number");
					if (t < 0)
						throw new RangeError("The value \"" + t + "\" is invalid for option \"size\"");
				}
				function c(t) {
					return a1(t), s2(t < 0 ? 0 : 0 | y(t));
				}
				function p(t) {
					const e = t.length < 0 ? 0 : 0 | y(t.length),
						r = s2(e);
					for (let n = 0; n < e; n += 1) r[n] = 255 & t[n];
					return r;
				}
				function l(t, e, r) {
					if (e < 0 || t.byteLength < e)
						throw new RangeError("\"offset\" is outside of buffer bounds");
					if (t.byteLength < e + (r || 0))
						throw new RangeError("\"length\" is outside of buffer bounds");
					let n;
					return n = void 0 === e && void 0 === r ? new Uint8Array(t) : void 0 === r ? new Uint8Array(t, e) : new Uint8Array(t, e, r), Object.setPrototypeOf(n, u2.prototype), n;
				}
				function y(t) {
					if (t >= f2)
						throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + f2.toString(16) + " bytes");
					return 0 | t;
				}
				function g(t, e) {
					if (u2.isBuffer(t)) return t.length;
					if (ArrayBuffer.isView(t) || J(t, ArrayBuffer)) return t.byteLength;
					if ("string" != typeof t)
						throw new TypeError("The \"string\" argument must be one of type string, Buffer, or ArrayBuffer. Received type " + typeof t);
					const r = t.length,
						n = arguments.length > 2 && !0 === arguments[2];
					if (!n && 0 === r) return 0;
					let o = !1;
					for (;;) switch (e) {
							case "ascii":
							case "latin1":
							case "binary":
								return r;
							case "utf8":
							case "utf-8":
								return q(t).length;
							case "ucs2":
							case "ucs-2":
							case "utf16le":
							case "utf-16le":
								return 2 * r;
							case "hex":
								return r >>> 1;
							case "base64":
								return W(t).length;
							default:
								if (o) return n ? -1 : q(t).length;
								e = ("" + e).toLowerCase(), o = !0;
					}
				}
				function d(t, e, r) {
					let n = !1;
					if ((void 0 === e || e < 0) && (e = 0), e > this.length) return "";
					if ((void 0 === r || r > this.length) && (r = this.length), r <= 0) return "";
					if ((r >>>= 0) <= (e >>>= 0)) return "";
					for (t || (t = "utf8");;) switch (t) {
							case "hex":
								return S(this, e, r);
							case "utf8":
							case "utf-8":
								return R(this, e, r);
							case "ascii":
								return T(this, e, r);
							case "latin1":
							case "binary":
								return L(this, e, r);
							case "base64":
								return U(this, e, r);
							case "ucs2":
							case "ucs-2":
							case "utf16le":
							case "utf-16le":
								return _(this, e, r);
							default:
								if (n)
									throw new TypeError("Unknown encoding: " + t);
								t = (t + "").toLowerCase(), n = !0;
					}
				}
				function w(t, e, r) {
					const n = t[e];
					t[e] = t[r], t[r] = n;
				}
				function b(t, e, r, n, o) {
					if (0 === t.length) return -1;
					if ("string" == typeof r ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), Z(r = +r) && (r = o ? 0 : t.length - 1), r < 0 && (r = t.length + r), r >= t.length) {
						if (o) return -1;
						r = t.length - 1;
					} else if (r < 0) {
						if (!o) return -1;
						r = 0;
					}
					if ("string" == typeof e && (e = u2.from(e, n)), u2.isBuffer(e)) return 0 === e.length ? -1 : B(t, e, r, n, o);
					if ("number" == typeof e) return e &= 255, "function" == typeof Uint8Array.prototype.indexOf ? o ? Uint8Array.prototype.indexOf.call(t, e, r) : Uint8Array.prototype.lastIndexOf.call(t, e, r) : B(t, [
								e
							], r, n, o);
					throw new TypeError("val must be string, number or Buffer");
				}
				function B(t5, e6, r, n, o) {
					let i,
						f = 1,
						s = t5.length,
						u = e6.length;
					if (void 0 !== n && ("ucs2" === (n = String(n).toLowerCase()) || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
						if (t5.length < 2 || e6.length < 2) return -1;
						f = 2, s /= 2, u /= 2, r /= 2;
					}
					function h(t, e) {
						return 1 === f ? t[e] : t.readUInt16BE(e * f);
					}
					if (o) {
						let n = -1;
						for (i = r; i < s; i++)
							if (h(t5, i) === h(e6, -1 === n ? 0 : i - n)) {
								if (-1 === n && (n = i), i - n + 1 === u) return n * f;
							} else -1 !== n && (i -= i - n), n = -1;
					} else
						for (r + u > s && (r = s - u), i = r; i >= 0; i--) {
							let r = !0;
							for (let n = 0; n < u; n++)
								if (h(t5, i + n) !== h(e6, n)) {
									r = !1;
									break;
							}
							if (r) return i;
					}
					return -1;
				}
				function m(t, e, r, n) {
					r = Number(r) || 0;
					const o = t.length - r;
					n ? (n = Number(n)) > o && (n = o) : n = o;
					const i = e.length;
					let f;
					for (n > i / 2 && (n = i / 2), f = 0; f < n; ++f) {
						const n = parseInt(e.substr(2 * f, 2), 16);
						if (Z(n)) return f;
						t[r + f] = n;
					}
					return f;
				}
				function E(t, e, r, n) {
					return X(q(e, t.length - r), t, r, n);
				}
				function A(t6, e7, r6, n) {
					return X(function(t) {
						const e = [];
						for (let r = 0; r < t.length; ++r) e.push(255 & t.charCodeAt(r));
						return e;
					}(e7), t6, r6, n);
				}
				function I(t, e, r, n) {
					return X(W(e), t, r, n);
				}
				function v(t7, e8, r7, n5) {
					return X(function(t, e) {
						let r,
							n,
							o;
						const i = [];
						for (let f = 0; f < t.length && !((e -= 2) < 0); ++f) r = t.charCodeAt(f), n = r >> 8, o = r % 256, i.push(o), i.push(n);
						return i;
					}(e8, t7.length - r7), t7, r7, n5);
				}
				function U(t, e, r) {
					return 0 === e && r === t.length ? n3.fromByteArray(t) : n3.fromByteArray(t.slice(e, r));
				}
				function R(t8, e9, r8) {
					r8 = Math.min(t8.length, r8);
					const n6 = [];
					let o = e9;
					for (; o < r8;) {
						const e = t8[o];
						let i = null,
							f = e > 239 ? 4 : e > 223 ? 3 : e > 191 ? 2 : 1;
						if (o + f <= r8) {
							let r,
								n,
								s,
								u;
							switch (f) {
								case 1:
									e < 128 && (i = e);
									break;
								case 2:
									r = t8[o + 1], 128 == (192 & r) && (u = (31 & e) << 6 | 63 & r, u > 127 && (i = u));
									break;
								case 3:
									r = t8[o + 1], n = t8[o + 2], 128 == (192 & r) && 128 == (192 & n) && (u = (15 & e) << 12 | (63 & r) << 6 | 63 & n, u > 2047 && (u < 55296 || u > 57343) && (i = u));
									break;
								case 4:
									r = t8[o + 1], n = t8[o + 2], s = t8[o + 3], 128 == (192 & r) && 128 == (192 & n) && 128 == (192 & s) && (u = (15 & e) << 18 | (63 & r) << 12 | (63 & n) << 6 | 63 & s, u > 65535 && u < 1114112 && (i = u));
							}
						}
						null === i ? (i = 65533, f = 1) : i > 65535 && (i -= 65536, n6.push(i >>> 10 & 1023 | 55296), i = 56320 | 1023 & i), n6.push(i), o += f;
					}
					return (function(t) {
						const e = t.length;
						if (e <= O) return String.fromCharCode.apply(String, t);
						let r = "",
							n = 0;
						for (; n < e;) r += String.fromCharCode.apply(String, t.slice(n, n += O));
						return r;
					})(n6);
				}
				e4.kMaxLength = f2, u2.TYPED_ARRAY_SUPPORT = (function() {
					try {
						const t = new Uint8Array(1),
							e = {
								foo: function() {
									return 42;
								}
							};
						return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(t, e), 42 === t.foo();
					} catch (t) {
						return !1;
					}
				})(), u2.TYPED_ARRAY_SUPPORT || "undefined" == typeof console || "function" != typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), Object.defineProperty(u2.prototype, "parent", {
					enumerable: !0,
					get: function() {
						if (u2.isBuffer(this)) return this.buffer;
					}
				}), Object.defineProperty(u2.prototype, "offset", {
					enumerable: !0,
					get: function() {
						if (u2.isBuffer(this)) return this.byteOffset;
					}
				}), u2.poolSize = 8192, u2.from = function(t, e, r) {
					return h2(t, e, r);
				}, Object.setPrototypeOf(u2.prototype, Uint8Array.prototype), Object.setPrototypeOf(u2, Uint8Array), u2.alloc = function(t9, e10, r9) {
					return (function(t, e, r) {
						return a1(t), t <= 0 ? s2(t) : void 0 !== e ? "string" == typeof r ? s2(t).fill(e, r) : s2(t).fill(e) : s2(t);
					})(t9, e10, r9);
				}, u2.allocUnsafe = function(t) {
					return c(t);
				}, u2.allocUnsafeSlow = function(t) {
					return c(t);
				}, u2.isBuffer = function(t) {
					return null != t && !0 === t._isBuffer && t !== u2.prototype;
				}, u2.compare = function(t, e) {
					if (J(t, Uint8Array) && (t = u2.from(t, t.offset, t.byteLength)), J(e, Uint8Array) && (e = u2.from(e, e.offset, e.byteLength)), !u2.isBuffer(t) || !u2.isBuffer(e))
						throw new TypeError("The \"buf1\", \"buf2\" arguments must be one of type Buffer or Uint8Array");
					if (t === e) return 0;
					let r = t.length,
						n = e.length;
					for (let o = 0, i = Math.min(r, n); o < i; ++o)
						if (t[o] !== e[o]) {
							r = t[o], n = e[o];
							break;
					}
					return r < n ? -1 : n < r ? 1 : 0;
				}, u2.isEncoding = function(t) {
					switch (String(t).toLowerCase()) {
						case "hex":
						case "utf8":
						case "utf-8":
						case "ascii":
						case "latin1":
						case "binary":
						case "base64":
						case "ucs2":
						case "ucs-2":
						case "utf16le":
						case "utf-16le":
							return !0;
						default:
							return !1;
					}
				}, u2.concat = function(t, e) {
					if (!Array.isArray(t))
						throw new TypeError("\"list\" argument must be an Array of Buffers");
					if (0 === t.length) return u2.alloc(0);
					let r;
					if (void 0 === e)
						for (e = 0, r = 0; r < t.length; ++r) e += t[r].length;
					const n = u2.allocUnsafe(e);
					let o = 0;
					for (r = 0; r < t.length; ++r) {
						let e = t[r];
						if (J(e, Uint8Array))
							o + e.length > n.length ? (u2.isBuffer(e) || (e = u2.from(e)), e.copy(n, o)) : Uint8Array.prototype.set.call(n, e, o);
						else {
							if (!u2.isBuffer(e))
								throw new TypeError("\"list\" argument must be an Array of Buffers");
							e.copy(n, o);
						}
						o += e.length;
					}
					return n;
				}, u2.byteLength = g, u2.prototype._isBuffer = !0, u2.prototype.swap16 = function() {
					const t = this.length;
					if (t % 2 != 0)
						throw new RangeError("Buffer size must be a multiple of 16-bits");
					for (let e = 0; e < t; e += 2) w(this, e, e + 1);
					return this;
				}, u2.prototype.swap32 = function() {
					const t = this.length;
					if (t % 4 != 0)
						throw new RangeError("Buffer size must be a multiple of 32-bits");
					for (let e = 0; e < t; e += 4) w(this, e, e + 3), w(this, e + 1, e + 2);
					return this;
				}, u2.prototype.swap64 = function() {
					const t = this.length;
					if (t % 8 != 0)
						throw new RangeError("Buffer size must be a multiple of 64-bits");
					for (let e = 0; e < t; e += 8) w(this, e, e + 7), w(this, e + 1, e + 6), w(this, e + 2, e + 5), w(this, e + 3, e + 4);
					return this;
				}, u2.prototype.toString = function() {
					const t = this.length;
					return 0 === t ? "" : 0 === arguments.length ? R(this, 0, t) : d.apply(this, arguments);
				}, u2.prototype.toLocaleString = u2.prototype.toString, u2.prototype.equals = function(t) {
					if (!u2.isBuffer(t))
						throw new TypeError("Argument must be a Buffer");
					return this === t || 0 === u2.compare(this, t);
				}, u2.prototype.inspect = function() {
					let t = "";
					const r = e4.INSPECT_MAX_BYTES;
					return t = this.toString("hex", 0, r).replace(/(.{2})/g, "$1 ").trim(), this.length > r && (t += " ... "), "<Buffer " + t + ">";
				}, i2 && (u2.prototype[i2] = u2.prototype.inspect), u2.prototype.compare = function(t, e, r, n, o) {
					if (J(t, Uint8Array) && (t = u2.from(t, t.offset, t.byteLength)), !u2.isBuffer(t))
						throw new TypeError("The \"target\" argument must be one of type Buffer or Uint8Array. Received type " + typeof t);
					if (void 0 === e && (e = 0), void 0 === r && (r = t ? t.length : 0), void 0 === n && (n = 0), void 0 === o && (o = this.length), e < 0 || r > t.length || n < 0 || o > this.length)
						throw new RangeError("out of range index");
					if (n >= o && e >= r) return 0;
					if (n >= o) return -1;
					if (e >= r) return 1;
					if (this === t) return 0;
					let i = (o >>>= 0) - (n >>>= 0),
						f = (r >>>= 0) - (e >>>= 0);
					const s = Math.min(i, f),
						h = this.slice(n, o),
						a = t.slice(e, r);
					for (let t10 = 0; t10 < s; ++t10)
						if (h[t10] !== a[t10]) {
							i = h[t10], f = a[t10];
							break;
					}
					return i < f ? -1 : f < i ? 1 : 0;
				}, u2.prototype.includes = function(t, e, r) {
					return -1 !== this.indexOf(t, e, r);
				}, u2.prototype.indexOf = function(t, e, r) {
					return b(this, t, e, r, !0);
				}, u2.prototype.lastIndexOf = function(t, e, r) {
					return b(this, t, e, r, !1);
				}, u2.prototype.write = function(t, e, r, n) {
					if (void 0 === e) n = "utf8", r = this.length, e = 0;
					else if (void 0 === r && "string" == typeof e) n = e, r = this.length, e = 0;
					else {
						if (!isFinite(e))
							throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
						e >>>= 0, isFinite(r) ? (r >>>= 0, void 0 === n && (n = "utf8")) : (n = r, r = void 0);
					}
					const o = this.length - e;
					if ((void 0 === r || r > o) && (r = o), t.length > 0 && (r < 0 || e < 0) || e > this.length)
						throw new RangeError("Attempt to write outside buffer bounds");
					n || (n = "utf8");
					let i = !1;
					for (;;) switch (n) {
							case "hex":
								return m(this, t, e, r);
							case "utf8":
							case "utf-8":
								return E(this, t, e, r);
							case "ascii":
							case "latin1":
							case "binary":
								return A(this, t, e, r);
							case "base64":
								return I(this, t, e, r);
							case "ucs2":
							case "ucs-2":
							case "utf16le":
							case "utf-16le":
								return v(this, t, e, r);
							default:
								if (i)
									throw new TypeError("Unknown encoding: " + n);
								n = ("" + n).toLowerCase(), i = !0;
					}
				}, u2.prototype.toJSON = function() {
					return {
						type: "Buffer",
						data: Array.prototype.slice.call(this._arr || this, 0)
					};
				};
				const O = 4096;
				function T(t, e, r) {
					let n = "";
					r = Math.min(t.length, r);
					for (let o = e; o < r; ++o) n += String.fromCharCode(127 & t[o]);
					return n;
				}
				function L(t, e, r) {
					let n = "";
					r = Math.min(t.length, r);
					for (let o = e; o < r; ++o) n += String.fromCharCode(t[o]);
					return n;
				}
				function S(t, e, r) {
					const n = t.length;
					(!e || e < 0) && (e = 0), (!r || r < 0 || r > n) && (r = n);
					let o = "";
					for (let n7 = e; n7 < r; ++n7) o += H[t[n7]];
					return o;
				}
				function _(t, e, r) {
					const n = t.slice(e, r);
					let o = "";
					for (let t11 = 0; t11 < n.length - 1; t11 += 2) o += String.fromCharCode(n[t11] + 256 * n[t11 + 1]);
					return o;
				}
				function x(t, e, r) {
					if (t % 1 != 0 || t < 0)
						throw new RangeError("offset is not uint");
					if (t + e > r)
						throw new RangeError("Trying to access beyond buffer length");
				}
				function C(t, e, r, n, o, i) {
					if (!u2.isBuffer(t))
						throw new TypeError("\"buffer\" argument must be a Buffer instance");
					if (e > o || e < i)
						throw new RangeError("\"value\" argument is out of bounds");
					if (r + n > t.length)
						throw new RangeError("Index out of range");
				}
				function M(t, e, r, n, o) {
					z(e, n, o, t, r, 7);
					let i = Number(e & BigInt(4294967295));
					t[r++] = i, i >>= 8, t[r++] = i, i >>= 8, t[r++] = i, i >>= 8, t[r++] = i;
					let f = Number(e >> BigInt(32) & BigInt(4294967295));
					return t[r++] = f, f >>= 8, t[r++] = f, f >>= 8, t[r++] = f, f >>= 8, t[r++] = f, r;
				}
				function $(t, e, r, n, o) {
					z(e, n, o, t, r, 7);
					let i = Number(e & BigInt(4294967295));
					t[r + 7] = i, i >>= 8, t[r + 6] = i, i >>= 8, t[r + 5] = i, i >>= 8, t[r + 4] = i;
					let f = Number(e >> BigInt(32) & BigInt(4294967295));
					return t[r + 3] = f, f >>= 8, t[r + 2] = f, f >>= 8, t[r + 1] = f, f >>= 8, t[r] = f, r + 8;
				}
				function P(t, e, r, n, o, i) {
					if (r + n > t.length)
						throw new RangeError("Index out of range");
					if (r < 0)
						throw new RangeError("Index out of range");
				}
				function N(t, e, r, n, i) {
					return e = +e, r >>>= 0, i || P(t, 0, r, 4), o2.write(t, e, r, n, 23, 4), r + 4;
				}
				function j(t, e, r, n, i) {
					return e = +e, r >>>= 0, i || P(t, 0, r, 8), o2.write(t, e, r, n, 52, 8), r + 8;
				}
				u2.prototype.slice = function(t, e) {
					const r = this.length;
					(t = ~~t) < 0 ? (t += r) < 0 && (t = 0) : t > r && (t = r), (e = void 0 === e ? r : ~~e) < 0 ? (e += r) < 0 && (e = 0) : e > r && (e = r), e < t && (e = t);
					const n = this.subarray(t, e);
					return Object.setPrototypeOf(n, u2.prototype), n;
				}, u2.prototype.readUintLE = u2.prototype.readUIntLE = function(t, e, r) {
					t >>>= 0, e >>>= 0, r || x(t, e, this.length);
					let n = this[t],
						o = 1,
						i = 0;
					for (; ++i < e && (o *= 256);) n += this[t + i] * o;
					return n;
				}, u2.prototype.readUintBE = u2.prototype.readUIntBE = function(t, e, r) {
					t >>>= 0, e >>>= 0, r || x(t, e, this.length);
					let n = this[t + --e],
						o = 1;
					for (; e > 0 && (o *= 256);) n += this[t + --e] * o;
					return n;
				}, u2.prototype.readUint8 = u2.prototype.readUInt8 = function(t, e) {
					return t >>>= 0, e || x(t, 1, this.length), this[t];
				}, u2.prototype.readUint16LE = u2.prototype.readUInt16LE = function(t, e) {
					return t >>>= 0, e || x(t, 2, this.length), this[t] | this[t + 1] << 8;
				}, u2.prototype.readUint16BE = u2.prototype.readUInt16BE = function(t, e) {
					return t >>>= 0, e || x(t, 2, this.length), this[t] << 8 | this[t + 1];
				}, u2.prototype.readUint32LE = u2.prototype.readUInt32LE = function(t, e) {
					return t >>>= 0, e || x(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3];
				}, u2.prototype.readUint32BE = u2.prototype.readUInt32BE = function(t, e) {
					return t >>>= 0, e || x(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
				}, u2.prototype.readBigUInt64LE = K(function(t) {
					Y(t >>>= 0, "offset");
					const e = this[t],
						r = this[t + 7];
					void 0 !== e && void 0 !== r || G(t, this.length - 8);
					const n = e + 256 * this[++t] + 65536 * this[++t] + this[++t] * 2 ** 24,
						o = this[++t] + 256 * this[++t] + 65536 * this[++t] + r * 2 ** 24;
					return BigInt(n) + (BigInt(o) << BigInt(32));
				}), u2.prototype.readBigUInt64BE = K(function(t) {
					Y(t >>>= 0, "offset");
					const e = this[t],
						r = this[t + 7];
					void 0 !== e && void 0 !== r || G(t, this.length - 8);
					const n = e * 2 ** 24 + 65536 * this[++t] + 256 * this[++t] + this[++t],
						o = this[++t] * 2 ** 24 + 65536 * this[++t] + 256 * this[++t] + r;
					return (BigInt(n) << BigInt(32)) + BigInt(o);
				}), u2.prototype.readIntLE = function(t, e, r) {
					t >>>= 0, e >>>= 0, r || x(t, e, this.length);
					let n = this[t],
						o = 1,
						i = 0;
					for (; ++i < e && (o *= 256);) n += this[t + i] * o;
					return o *= 128, n >= o && (n -= Math.pow(2, 8 * e)), n;
				}, u2.prototype.readIntBE = function(t, e, r) {
					t >>>= 0, e >>>= 0, r || x(t, e, this.length);
					let n = e,
						o = 1,
						i = this[t + --n];
					for (; n > 0 && (o *= 256);) i += this[t + --n] * o;
					return o *= 128, i >= o && (i -= Math.pow(2, 8 * e)), i;
				}, u2.prototype.readInt8 = function(t, e) {
					return t >>>= 0, e || x(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t];
				}, u2.prototype.readInt16LE = function(t, e) {
					t >>>= 0, e || x(t, 2, this.length);
					const r = this[t] | this[t + 1] << 8;
					return 32768 & r ? 4294901760 | r : r;
				}, u2.prototype.readInt16BE = function(t, e) {
					t >>>= 0, e || x(t, 2, this.length);
					const r = this[t + 1] | this[t] << 8;
					return 32768 & r ? 4294901760 | r : r;
				}, u2.prototype.readInt32LE = function(t, e) {
					return t >>>= 0, e || x(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
				}, u2.prototype.readInt32BE = function(t, e) {
					return t >>>= 0, e || x(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
				}, u2.prototype.readBigInt64LE = K(function(t) {
					Y(t >>>= 0, "offset");
					const e = this[t],
						r = this[t + 7];
					void 0 !== e && void 0 !== r || G(t, this.length - 8);
					const n = this[t + 4] + 256 * this[t + 5] + 65536 * this[t + 6] + (r << 24);
					return (BigInt(n) << BigInt(32)) + BigInt(e + 256 * this[++t] + 65536 * this[++t] + this[++t] * 2 ** 24);
				}), u2.prototype.readBigInt64BE = K(function(t) {
					Y(t >>>= 0, "offset");
					const e = this[t],
						r = this[t + 7];
					void 0 !== e && void 0 !== r || G(t, this.length - 8);
					const n = (e << 24) + 65536 * this[++t] + 256 * this[++t] + this[++t];
					return (BigInt(n) << BigInt(32)) + BigInt(this[++t] * 2 ** 24 + 65536 * this[++t] + 256 * this[++t] + r);
				}), u2.prototype.readFloatLE = function(t, e) {
					return t >>>= 0, e || x(t, 4, this.length), o2.read(this, t, !0, 23, 4);
				}, u2.prototype.readFloatBE = function(t, e) {
					return t >>>= 0, e || x(t, 4, this.length), o2.read(this, t, !1, 23, 4);
				}, u2.prototype.readDoubleLE = function(t, e) {
					return t >>>= 0, e || x(t, 8, this.length), o2.read(this, t, !0, 52, 8);
				}, u2.prototype.readDoubleBE = function(t, e) {
					return t >>>= 0, e || x(t, 8, this.length), o2.read(this, t, !1, 52, 8);
				}, u2.prototype.writeUintLE = u2.prototype.writeUIntLE = function(t, e, r, n) {
					t = +t, e >>>= 0, r >>>= 0, n || C(this, t, e, r, Math.pow(2, 8 * r) - 1, 0);
					let o = 1,
						i = 0;
					for (this[e] = 255 & t; ++i < r && (o *= 256);) this[e + i] = t / o & 255;
					return e + r;
				}, u2.prototype.writeUintBE = u2.prototype.writeUIntBE = function(t, e, r, n) {
					t = +t, e >>>= 0, r >>>= 0, n || C(this, t, e, r, Math.pow(2, 8 * r) - 1, 0);
					let o = r - 1,
						i = 1;
					for (this[e + o] = 255 & t; --o >= 0 && (i *= 256);) this[e + o] = t / i & 255;
					return e + r;
				}, u2.prototype.writeUint8 = u2.prototype.writeUInt8 = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 1, 255, 0), this[e] = 255 & t, e + 1;
				}, u2.prototype.writeUint16LE = u2.prototype.writeUInt16LE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 2, 65535, 0), this[e] = 255 & t, this[e + 1] = t >>> 8, e + 2;
				}, u2.prototype.writeUint16BE = u2.prototype.writeUInt16BE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 2, 65535, 0), this[e] = t >>> 8, this[e + 1] = 255 & t, e + 2;
				}, u2.prototype.writeUint32LE = u2.prototype.writeUInt32LE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 4, 4294967295, 0), this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t, e + 4;
				}, u2.prototype.writeUint32BE = u2.prototype.writeUInt32BE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 4, 4294967295, 0), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t, e + 4;
				}, u2.prototype.writeBigUInt64LE = K(function(t, e = 0) {
					return M(this, t, e, BigInt(0), BigInt("0xffffffffffffffff"));
				}), u2.prototype.writeBigUInt64BE = K(function(t, e = 0) {
					return $(this, t, e, BigInt(0), BigInt("0xffffffffffffffff"));
				}), u2.prototype.writeIntLE = function(t, e, r, n) {
					if (t = +t, e >>>= 0, !n) {
						const n = Math.pow(2, 8 * r - 1);
						C(this, t, e, r, n - 1, -n);
					}
					let o = 0,
						i = 1,
						f = 0;
					for (this[e] = 255 & t; ++o < r && (i *= 256);) t < 0 && 0 === f && 0 !== this[e + o - 1] && (f = 1), this[e + o] = (t / i >> 0) - f & 255;
					return e + r;
				}, u2.prototype.writeIntBE = function(t, e, r, n) {
					if (t = +t, e >>>= 0, !n) {
						const n = Math.pow(2, 8 * r - 1);
						C(this, t, e, r, n - 1, -n);
					}
					let o = r - 1,
						i = 1,
						f = 0;
					for (this[e + o] = 255 & t; --o >= 0 && (i *= 256);) t < 0 && 0 === f && 0 !== this[e + o + 1] && (f = 1), this[e + o] = (t / i >> 0) - f & 255;
					return e + r;
				}, u2.prototype.writeInt8 = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 1, 127, -128), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1;
				}, u2.prototype.writeInt16LE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 2, 32767, -32768), this[e] = 255 & t, this[e + 1] = t >>> 8, e + 2;
				}, u2.prototype.writeInt16BE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 2, 32767, -32768), this[e] = t >>> 8, this[e + 1] = 255 & t, e + 2;
				}, u2.prototype.writeInt32LE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 4, 2147483647, -2147483648), this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24, e + 4;
				}, u2.prototype.writeInt32BE = function(t, e, r) {
					return t = +t, e >>>= 0, r || C(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t, e + 4;
				}, u2.prototype.writeBigInt64LE = K(function(t, e = 0) {
					return M(this, t, e, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
				}), u2.prototype.writeBigInt64BE = K(function(t, e = 0) {
					return $(this, t, e, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
				}), u2.prototype.writeFloatLE = function(t, e, r) {
					return N(this, t, e, !0, r);
				}, u2.prototype.writeFloatBE = function(t, e, r) {
					return N(this, t, e, !1, r);
				}, u2.prototype.writeDoubleLE = function(t, e, r) {
					return j(this, t, e, !0, r);
				}, u2.prototype.writeDoubleBE = function(t, e, r) {
					return j(this, t, e, !1, r);
				}, u2.prototype.copy = function(t, e, r, n) {
					if (!u2.isBuffer(t))
						throw new TypeError("argument should be a Buffer");
					if (r || (r = 0), n || 0 === n || (n = this.length), e >= t.length && (e = t.length), e || (e = 0), n > 0 && n < r && (n = r), n === r) return 0;
					if (0 === t.length || 0 === this.length) return 0;
					if (e < 0)
						throw new RangeError("targetStart out of bounds");
					if (r < 0 || r >= this.length)
						throw new RangeError("Index out of range");
					if (n < 0)
						throw new RangeError("sourceEnd out of bounds");
					n > this.length && (n = this.length), t.length - e < n - r && (n = t.length - e + r);
					const o = n - r;
					return this === t && "function" == typeof Uint8Array.prototype.copyWithin ? this.copyWithin(e, r, n) : Uint8Array.prototype.set.call(t, this.subarray(r, n), e), o;
				}, u2.prototype.fill = function(t, e, r, n) {
					if ("string" == typeof t) {
						if ("string" == typeof e ? (n = e, e = 0, r = this.length) : "string" == typeof r && (n = r, r = this.length), void 0 !== n && "string" != typeof n)
							throw new TypeError("encoding must be a string");
						if ("string" == typeof n && !u2.isEncoding(n))
							throw new TypeError("Unknown encoding: " + n);
						if (1 === t.length) {
							const e = t.charCodeAt(0);
							("utf8" === n && e < 128 || "latin1" === n) && (t = e);
						}
					} else
						"number" == typeof t ? t &= 255 : "boolean" == typeof t && (t = Number(t));
					if (e < 0 || this.length < e || this.length < r)
						throw new RangeError("Out of range index");
					if (r <= e) return this;
					let o;
					if (e >>>= 0, r = void 0 === r ? this.length : r >>> 0, t || (t = 0), "number" == typeof t)
						for (o = e; o < r; ++o) this[o] = t;
					else {
						const i = u2.isBuffer(t) ? t : u2. from (t, n),
							f = i.length;
						if (0 === f)
							throw new TypeError("The value \"" + t + "\" is invalid for argument \"value\"");
						for (o = 0; o < r - e; ++o) this[o + e] = i[o % f];
					}
					return this;
				};
				const k = {
				};
				function F(t12, e, r) {
					k[t12] = class _class extends r {
						get code() {
							return t12;
						}
						set code(t) {
							Object.defineProperty(this, "code", {
								configurable: !0,
								enumerable: !0,
								value: t,
								writable: !0
							});
						}
						toString() {
							return `${this.name} [${t12}]: ${this.message}`;
						}
						constructor() {
							super(), Object.defineProperty(this, "message", {
								value: e.apply(this, arguments),
								writable: !0,
								configurable: !0
							}), this.name = `${this.name} [${t12}]`, this.stack,
							delete this.name;
						}
					}
					;
				}
				function D(t) {
					let e = "",
						r = t.length;
					const n = "-" === t[0] ? 1 : 0;
					for (; r >= n + 4; r -= 3) e = `_${t.slice(r - 3, r)}${e}`;
					return `${t.slice(0, r)}${e}`;
				}
				function z(t13, e11, r10, n, o, i) {
					if (t13 > r10 || t13 < e11) {
						const n = "bigint" == typeof e11 ? "n" : "";
						let o;
						throw o = i > 3 ? 0 === e11 || e11 === BigInt(0) ? `>= 0${n} and < 2${n} ** ${8 * (i + 1)}${n}` : `>= -(2${n} ** ${8 * (i + 1) - 1}${n}) and < 2 ** ${8 * (i + 1) - 1}${n}` : `>= ${e11}${n} and <= ${r10}${n}`, new k.ERR_OUT_OF_RANGE("value", o, t13);
					}
					!function(t, e, r) {
						Y(e, "offset"), void 0 !== t[e] && void 0 !== t[e + r] || G(e, t.length - (r + 1));
					}(n, o, i);
				}
				function Y(t, e) {
					if ("number" != typeof t)
						throw new k.ERR_INVALID_ARG_TYPE(e, "number", t);
				}
				function G(t, e, r) {
					if (Math.floor(t) !== t)
						throw Y(t, r), new k.ERR_OUT_OF_RANGE(r || "offset", "an integer", t);
					if (e < 0)
						throw new k.ERR_BUFFER_OUT_OF_BOUNDS;
					throw new k.ERR_OUT_OF_RANGE(r || "offset", `>= ${r ? 1 : 0} and <= ${e}`, t);
				}
				F("ERR_BUFFER_OUT_OF_BOUNDS", function(t) {
					return t ? `${t} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
				}, RangeError), F("ERR_INVALID_ARG_TYPE", function(t, e) {
					return `The "${t}" argument must be of type number. Received type ${typeof e}`;
				}, TypeError), F("ERR_OUT_OF_RANGE", function(t, e, r) {
					let n = `The value of "${t}" is out of range.`,
						o = r;
					return Number.isInteger(r) && Math.abs(r) > 2 ** 32 ? o = D(String(r)) : "bigint" == typeof r && (o = String(r), (r > BigInt(2) ** BigInt(32) || r < -(BigInt(2) ** BigInt(32))) && (o = D(o)), o += "n"), n += ` It must be ${e}. Received ${o}`, n;
				}, RangeError);
				const V = /[^+/0-9A-Za-z-_]/g;
				function q(t, e) {
					let r;
					e = e || 1 / 0;
					const n = t.length;
					let o = null;
					const i = [];
					for (let f = 0; f < n; ++f) {
						if (r = t.charCodeAt(f), r > 55295 && r < 57344) {
							if (!o) {
								if (r > 56319) {
									(e -= 3) > -1 && i.push(239, 191, 189);
									continue;
								}
								if (f + 1 === n) {
									(e -= 3) > -1 && i.push(239, 191, 189);
									continue;
								}
								o = r;
								continue;
							}
							if (r < 56320) {
								(e -= 3) > -1 && i.push(239, 191, 189), o = r;
								continue;
							}
							r = 65536 + (o - 55296 << 10 | r - 56320);
						} else o && (e -= 3) > -1 && i.push(239, 191, 189);
						if (o = null, r < 128) {
							if ((e -= 1) < 0) break;
							i.push(r);
						} else if (r < 2048) {
							if ((e -= 2) < 0) break;
							i.push(r >> 6 | 192, 63 & r | 128);
						} else if (r < 65536) {
							if ((e -= 3) < 0) break;
							i.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128);
						} else {
							if (!(r < 1114112))
								throw new Error("Invalid code point");
							if ((e -= 4) < 0) break;
							i.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128);
						}
					}
					return i;
				}
				function W(t14) {
					return n3.toByteArray(function(t) {
						if ((t = (t = t.split("=")[0]).trim().replace(V, "")).length < 2) return "";
						for (; t.length % 4 != 0;) t += "=";
						return t;
					}(t14));
				}
				function X(t, e, r, n) {
					let o;
					for (o = 0; o < n && !(o + r >= e.length || o >= t.length); ++o) e[o + r] = t[o];
					return o;
				}
				function J(t, e) {
					return t instanceof e || null != t && null != t.constructor && null != t.constructor.name && t.constructor.name === e.name;
				}
				function Z(t) {
					return t != t;
				}
				const H = function() {
					const t = "0123456789abcdef",
						e = new Array(256);
					for (let r = 0; r < 16; ++r) {
						const n = 16 * r;
						for (let o = 0; o < 16; ++o) e[n + o] = t[r] + t[o];
					}
					return e;
				}();
				function K(t) {
					return "undefined" == typeof BigInt ? Q : t;
				}
				function Q() {
					throw new Error("BigInt not supported");
				}
			},
			645: (t15, e12) => {
				e12.read = function(t, e, r, n, o) {
					var i,
						f,
						s = 8 * o - n - 1,
						u = (1 << s) - 1,
						h = u >> 1,
						a = -7,
						c = r ? o - 1 : 0,
						p = r ? -1 : 1,
						l = t[e + c];
					for (c += p, i = l & (1 << -a) - 1, l >>= -a, a += s; a > 0; i = 256 * i + t[e + c], c += p, a -= 8) ;
					for (f = i & (1 << -a) - 1, i >>= -a, a += n; a > 0; f = 256 * f + t[e + c], c += p, a -= 8) ;
					if (0 === i)
						i = 1 - h;
					else {
						if (i === u) return f ? NaN : 1 / 0 * (l ? -1 : 1);
						f += Math.pow(2, n), i -= h;
					}
					return (l ? -1 : 1) * f * Math.pow(2, i - n);
				}, e12.write = function(t, e, r, n, o, i) {
					var f,
						s,
						u,
						h = 8 * i - o - 1,
						a = (1 << h) - 1,
						c = a >> 1,
						p = 23 === o ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
						l = n ? 0 : i - 1,
						y = n ? 1 : -1,
						g = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0;
					for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (s = isNaN(e) ? 1 : 0, f = a) : (f = Math.floor(Math.log(e) / Math.LN2), e * (u = Math.pow(2, -f)) < 1 && (f--, u *= 2), (e += f + c >= 1 ? p / u : p * Math.pow(2, 1 - c)) * u >= 2 && (f++, u /= 2), f + c >= a ? (s = 0, f = a) : f + c >= 1 ? (s = (e * u - 1) * Math.pow(2, o), f += c) : (s = e * Math.pow(2, c - 1) * Math.pow(2, o), f = 0)); o >= 8; t[r + l] = 255 & s, l += y, s /= 256, o -= 8) ;
					for (f = f << o | s, h += o; h > 0; t[r + l] = 255 & f, l += y, f /= 256, h -= 8) ;
					t[r + l - y] |= 128 * g;
				};
			}
		},
		e1 = {
		};
	function r1(n) {
		var o = e1[n];
		if (void 0 !== o) return o.exports;
		var i = e1[n] = {
			exports: {
			}
		};
		return t1[n](i, i.exports, r1), i.exports;
	}
	r1.d = (t, e) => {
		for (var n in e) r1.o(e, n) && !r1.o(t, n) && Object.defineProperty(t, n, {
				enumerable: !0,
				get: e[n]
			});
	}, r1.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)
	, r1.r = (t) => {
		"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
			value: "Module"
		}), Object.defineProperty(t, "__esModule", {
			value: !0
		});
	};
	var n1 = {
	};
	(() => {
		r1.r(n1), r1.d(n1, {
			default: () => t});
		const t = r1(764);
	})(), module.exports.Buffer = n1;
})();
const Buffer = module.exports.Buffer.default.Buffer;
module.exports.Buffer.default;

function DiscordProviders({children}) {
	const {AccessibilityProvider, LayerProvider, container} = DiscordModules.DiscordProviders;
	return React.createElement(AccessibilityProvider, {
		value: {
			reducedMotion: {
				value: false,
				rawValue: "no-preference"
			}
		}
	}, React.createElement(LayerProvider, {
		value: [
			container
		]
	}, children));
}

function _extends$1() {
	_extends$1 = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends$1.apply(this, arguments);
}
function BDLogo(props) {
	return ( /*#__PURE__*/ React.createElement("svg", _extends$1({
		width: "24",
		height: "24",
		viewBox: "0 0 2000 2000"
	}, props), /*#__PURE__*/ React.createElement("g", null, /*#__PURE__*/ React.createElement("path", {
		fill: "#3E82E5",
		d: "M1402.2,631.7c-9.7-353.4-286.2-496-642.6-496H68.4v714.1l442,398V490.7h257c274.5,0,274.5,344.9,0,344.9H597.6v329.5h169.8c274.5,0,274.5,344.8,0,344.8h-699v354.9h691.2c356.3,0,632.8-142.6,642.6-496c0-162.6-44.5-284.1-122.9-368.6C1357.7,915.8,1402.2,794.3,1402.2,631.7z"
	}), /*#__PURE__*/ React.createElement("path", {
		fill: "#FFFFFF",
		d: "M1262.5,135.2L1262.5,135.2l-76.8,0c26.6,13.3,51.7,28.1,75,44.3c70.7,49.1,126.1,111.5,164.6,185.3c39.9,76.6,61.5,165.6,64.3,264.6l0,1.2v1.2c0,141.1,0,596.1,0,737.1v1.2l0,1.2c-2.7,99-24.3,188-64.3,264.6c-38.5,73.8-93.8,136.2-164.6,185.3c-22.6,15.7-46.9,30.1-72.6,43.1h72.5c346.2,1.9,671-171.2,671-567.9V716.7C1933.5,312.2,1608.7,135.2,1262.5,135.2z"
	}))));
}

function _extends() {
	_extends = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends.apply(this, arguments);
}
function UpdaterContextMenu() {
	const {ContextMenu} = DiscordModules;
	return ( /*#__PURE__*/ React.createElement(ContextMenu.Menu, {
		navId: "UpdaterContextMenu",
		onClose: ContextMenu.close
	}, /*#__PURE__*/ React.createElement(ContextMenu.Item, {
		label: "Update All",
		id: "update-all",
		action: async () => {
			const updates = Object.values(UpdaterApi.getState().updates);
			for (let i = 0; i < updates.length; i++) {
				updates[i].update(false);
			}
		}
	}), /*#__PURE__*/ React.createElement(ContextMenu.Item, {
		label: "Skip Updates",
		id: "skip-updates",
		action: () => {
			UpdaterApi.setState({
				updates: {
				}
			});
			Toasts$1.show("Updates Skipped!", {
				type: "success"
			});
		}
	})));
}
function UpdaterButton() {
	const {ContextMenu} = DiscordModules;
	const count = useUpdaterStore((state) => Object.keys(state.updates).length
	);
	if (count < 1) return null;
	const handleContextMenu = function(event) {
		ContextMenu.open(event, UpdaterContextMenu);
	};
	return ( /*#__PURE__*/ React.createElement(DiscordProviders, null, /*#__PURE__*/ React.createElement(DiscordModules.Tooltips.default, {
		text: `${count} update${count > 1 ? "s" : ""} available!`,
		position: "left"
	}, (props) => /*#__PURE__*/ React.createElement("div", _extends({
	}, props, {
		className: "bd-updater-button",
		onClick: () => {},
		onContextMenu: handleContextMenu,
		"data-updates": count
	}), /*#__PURE__*/ React.createElement(BDLogo, {
		width: "28",
		height: "28"
	}))
	)));
} // @ts-ignore
window.BDUpdater = {
	useUpdaterStore
};

class UpdaterNode {
	async update(showToast) {
		await new Promise((res, rej) => {
			fs$1.writeFile(this.addon.path, this.code, (error) => {
				if (error) rej(error);
				else res();
			});
		});
		UpdaterApi.setState((state) => {
			const updates = {
				...state.updates
			};
			delete updates[this.addon.name];
			return {
				updates
			};
		});
		if (showToast) this.showNotice();
	}
	showNotice() {
		Toasts$1.show(`${this.addon.name} was updated from ${this.currentVersion} to ${this.remoteVersion}.`);
	}
	constructor(addon1, code, currentVersion, remoteVersion1, pending) {
		Object.assign(this, {
			code,
			currentVersion,
			remoteVersion: remoteVersion1,
			addon: addon1,
			pending
		});
	}
}
class AddonUpdater {
	static getAddons(type) {
		let manager = null;
		switch (type) {
			case "plugin": {
				manager = PluginsManager;
				break;
			}
			case "theme": {
				manager = ThemesManager;
				break;
			}
			default: {
				Logger.error("AddonUpdater", `Unsupported addon type: ${type}`);
			}
		}
		if (!manager) return;
		var _updateUrl;
		return Object.fromEntries(manager.addons.map((addon) => {
			var ref,
				ref1,
				ref2;
			return [
				addon.name,
				{
					version: this.parseVersion(addon),
					addon,
					updateUrl: (_updateUrl = addon.updateUrl) !== null && _updateUrl !== void 0 ? _updateUrl : (ref = addon.instance) === null || ref === void 0 ? void 0 : (ref1 = ref._config) === null || ref1 === void 0 ? void 0 : (ref2 = ref1.info) === null || ref2 === void 0 ? void 0 : ref2.github_raw
				}
			];
		}));
	}
	static parseVersionString(code1) {
		var ref;
		const version = (ref = code1.match(this.versionRegex)) === null || ref === void 0 ? void 0 : ref.toString();
		if (!version) return null;
		return version.replace(/['"]/g, "");
	}
	static parseVersion(addonOrString) {
		var ref;
		if (typeof addonOrString === "string") return this.parseVersionString(addonOrString);
		if (addonOrString.version) return addonOrString.version;
		var ref3;
		if (typeof ((ref = addonOrString.instance) === null || ref === void 0 ? void 0 : ref.getVersion) === "function") return (ref3 = addonOrString.instance.getVersion()) !== null && ref3 !== void 0 ? ref3 : "0.0.0";
		return "0.0.0";
	}
	static initialize() {
		const wrapper = DOM.createElement("div", {
			className: "bd-updater-wrapper"
		});
		DiscordModules.ReactDOM.render(React.createElement(UpdaterButton, {
		}), wrapper);
		document.body.appendChild(wrapper);
		this.patchZlibUpdater();
		this.checkAllUpdates();
		setInterval(() => this.checkAllUpdates()
			, 1800000); // 30minutes
	}
	static patchZlibUpdater() {
		try {
			const updater = window.PluginUpdater;
			if (updater && typeof updater.checkAll === "function") {
				updater.checkAll = async () => {};
			}
		} catch (error) {
			Logger.error("AddonUpdater", "Failed to patch zlibrary updater:", error);
		}
	}
	static async checkAllUpdates() {
		let found = {
		};
		for (const type of [
				"theme",
				"plugin"
		]) {
			const addons = this.getAddons(type);
			for (const addonId in addons) {
				const {addon, updateUrl} = addons[addonId];
				if (!updateUrl) {
					Logger.warn(`AddonUpdater:${type}s`, `Could not resolve updating url for ${addonId}.`);
					continue;
				}
				try {
					const data = await this.fetchUpdate(addon, updateUrl);
					if (data.pending)
						found[addonId] = data;
				} catch (error) {
					Logger.error("AddonUpdater", `Failed to fetch update for ${addonId}:`, error);
				}
			}
		}
		if (Object.keys(found) == 0) return;
		UpdaterApi.setState((state) => ({
			updates: Object.assign({
			}, state.updates, found)
		})
		);
	}
	static fetchUpdate(addon, url) {
		return new Promise((resolve, rej) => {
			request(url, (res) => {
				const data = [];
				res.on("data", (chunk) => data.push(chunk)
				);
				res.on("end", () => {
					const raw = data.join("");
					const remoteVersion = this.parseVersionString(raw);
					const localVersion = this.parseVersion(addon);
					const hasChanges = remoteVersion && this.compareVersions(remoteVersion, localVersion);
					resolve(new UpdaterNode(addon, raw, localVersion, remoteVersion, hasChanges));
				});
				res.on("error", rej);
			});
		});
	}
	static compareVersions(version1, version2) {
		// Very very lazy compare, I don't wanna bother with people versioning their addons like 1.   beta.aplha.24
		return version1 !== version2;
	}
}
AddonUpdater.versionRegex = /['"][0-9]+\.[0-9]+\.[0-9]+['"]/i;

const EXPOSE_PROCESS_GLOBAL = "bdcompat-expose-process-global";

/// <reference path="../../types.d.ts" />
const SettingsSections = [
	{
		section: "DIVIDER"
	},
	{
		section: "HEADER",
		label: "BetterDiscord"
	},
	{
		id: "bdcompat-settings-settings",
		section: "settings",
		label: "Settings",
		className: "bdcompat-settings-item-settings",
		element: () => DiscordModules.React.createElement(SettingsPanel, {
		})
	},
	{
		id: "bdcompat-settings-plugins",
		section: "plugins",
		label: "Plugins",
		className: "bdcompat-settings-item-plugins",
		element: () => DiscordModules.React.createElement(AddonPanel, {
			manager: PluginsManager,
			type: "plugin"
		})
	},
	{
		id: "bdcompat-settings-themes",
		section: "themes",
		label: "Themes",
		className: "bdcompat-settings-item-themes",
		element: () => DiscordModules.React.createElement(AddonPanel, {
			manager: ThemesManager,
			type: "theme"
		})
	}
];
if (!window.process) {
	BDCompatNative.IPC.dispatch(EXPOSE_PROCESS_GLOBAL);
}
var index = new class BDCompat {
	start() {
		Webpack.whenReady.then(this.onStart.bind(this));
	}
	onStart() {
		this.polyfillWebpack();
		Object.assign(window, {
			require: Require,
			Buffer: Buffer,
			React: DiscordModules.React
		});
		this.exposeBdApi();
		this.patchSettingsView();
		DataStore.initialize();
		SettingsManager.initialize();
		Toasts$1.initialize();
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
		if (typeof webpackJsonp !== "undefined") return;
		window.webpackJsonp = [];
		Object.defineProperty(window.webpackJsonp, "__polyfill", {
			value: true
		});
		window.webpackJsonp.length = 10000; // In case plugins are waiting for that.
		window.webpackJsonp.flat = () => window.webpackJsonp
		;
		window.webpackJsonp.push = ([[], module, [[id]]]) => {
			return module[id]({
			}, {
			}, Webpack.request(false));
		};
	}
	appendStyles() {
		const dist = BDCompatNative.executeJS("__dirname", new Error().stack);
		const stylesPath = path.resolve(dist, "style.css");
		if (!fs$1.existsSync(stylesPath)) return;
		DOM.injectCSS("core", fs$1.readFileSync(stylesPath, "utf8"));
	}
	patchSettingsView() {
		const SettingsView = Webpack.findByDisplayName("SettingsView");
		Patcher.after("BDCompatSettings", SettingsView.prototype, "getPredicateSections", (_, __, res) => {
			if (!Array.isArray(res) || !res.some((e) => {
					var ref;
					return (e === null || e === void 0 ? void 0 : (ref = e.section) === null || ref === void 0 ? void 0 : ref.toLowerCase()) === "changelog";
				}) || res.some((s) => {
					return (s === null || s === void 0 ? void 0 : s.id) === "bdcompat-settings-settings";
				})) return;
			const index = res.findIndex((s) => {
					var ref;
					return (s === null || s === void 0 ? void 0 : (ref = s.section) === null || ref === void 0 ? void 0 : ref.toLowerCase()) === "changelog";
				}) - 1;
			if (index < 0) return;
			res.splice(index, 0, ...SettingsSections);
		});
	}
	constructor() {
		this.styles = [
			"./ui/toast.css",
			"./ui/addons.css",
			"./ui/settings.css"
		];
	}
};

export { index as default };
