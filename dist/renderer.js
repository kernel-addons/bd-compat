/// <reference path="../../../../types.d.ts" />
class fs {
	static readFileSync(path, options = "utf8") {
		return BDCompatNative.executeJS(`require("fs").readFileSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`);
	}
	static writeFileSync(path1, data, options1) {
		return BDCompatNative.executeJS(`require("fs").writeFileSync(${JSON.stringify(path1)}, ${JSON.stringify(data)}, ${JSON.stringify(options1)})`);
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
		return BDCompatNative.executeJS(`require("fs").readdirSync(${JSON.stringify(path3)}, ${JSON.stringify(options3)});`);
	}
	static existsSync(path4) {
		return BDCompatNative.executeJS(`require("fs").existsSync(${JSON.stringify(path4)});`);
	}
	static mkdirSync(path5, options4) {
		return BDCompatNative.executeJS(`require("fs").mkdirSync(${JSON.stringify(path5)}, ${JSON.stringify(options4)});`);
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
        `);
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
        `);
	}
}
var fs$1 = typeof __BDCOMPAT_LEAKED__ === "undefined" ? fs : window.require("fs");

var path = typeof __BDCOMPAT_LEAKED__ === "undefined" ? BDCompatNative.executeJS(`require("path")`) : window.require("path");

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
		console[type1](`%c[Kernel:BDCompat]%c %c[${module}]%c`, "color: #A8D46B; font-weight: 700;", "", "color: #A8D46B", "", ...nessage);
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
		if (!fs$1.existsSync(this.pluginsFolder)) {
			try {
				fs$1.mkdirSync(this.pluginsFolder);
			} catch (error) {
				Logger.error("DataStore", `Failed to create missing plugins folder:`, error);
			}
		}
		if (!fs$1.existsSync(this.themesFolder)) {
			try {
				fs$1.mkdirSync(this.themesFolder);
			} catch (error) {
				Logger.error("DataStore", `Failed to create missing themes folder:`, error);
			}
		}
		if (!fs$1.existsSync(this.dataFolder)) {
			try {
				fs$1.mkdirSync(this.dataFolder);
			} catch (error) {
				Logger.error("DataStore", `Failed to create missing config folder:`, error);
			}
		}
	}
	static tryLoadPluginData(pluginName) {
		this.pluginData[pluginName] = {
		};
		try {
			const data = JSON.parse(fs$1.readFileSync(path.join(this.dataFolder, `${pluginName}.json`), "utf8"));
			this.pluginData[pluginName] = data;
			return;
		} catch (error) {
			if (error.message.startsWith("ENOENT:")) return;
			Logger.error("DataStore", `PluginData for ${pluginName} seems corrupted.`, error);
		}
	}
	static saveData(pluginName1, data) {
		try {
			fs$1.writeFileSync(path.resolve(this.dataFolder, `${pluginName1}.json`), JSON.stringify(data, null, "\t"), "utf8");
		} catch (error) {
			Logger.error("DataStore", `Failed to save PluginData for ${pluginName1}:`, error);
		}
	}
	static setPluginData(pluginName2, key, value) {
		var ref;
		const data = {
			settings: Object.assign({
			}, (ref = this.pluginData[pluginName2]) === null || ref === void 0 ? void 0 : ref.settings, {
				[key]: value
			})
		};
		this.pluginData[pluginName2] = data;
		this.saveData(pluginName2, data);
	}
	static getPluginData(pluginName3, key1) {
		var ref;
		if (!this.pluginData[pluginName3]) {
			this.tryLoadPluginData(pluginName3);
		}
		return (ref = this.pluginData[pluginName3].settings) === null || ref === void 0 ? void 0 : ref[key1];
	}
	static deletePluginData(pluginName4, key2) {
		var ref,
			ref1,
			ref2;
		if (!this.pluginData[pluginName4]) {
			this.tryLoadPluginData(pluginName4);
		}
		if (!this.pluginData[pluginName4]) return;
		if (typeof ((ref = this.pluginData[pluginName4]) === null || ref === void 0 ? void 0 : (ref1 = ref.settings) === null || ref1 === void 0 ? void 0 : ref1[key2]))
			(ref2 = this.pluginData[pluginName4].settings) === null || ref2 === void 0 ? void 0 :
				delete ref2[key2];
		this.saveData(pluginName4, this.pluginData[pluginName4]);
	}
}
DataStore.pluginData = {
};
DataStore.pluginsFolder = path.resolve(BDCompatNative.executeJS("__dirname"), "..", "plugins");
DataStore.themesFolder = path.resolve(DataStore.pluginsFolder, "..", "themes");
DataStore.dataFolder = path.resolve(DataStore.pluginsFolder, "..", "config");

function memoize(target, key, getter) {
	const value = getter();
	Object.defineProperty(target, key, {
		value: value,
		configurable: true
	});
	return value;
}

function _classPrivateFieldGet(receiver, privateMap) {
	if (!privateMap.has(receiver)) {
		throw new TypeError("attempted to get private field on non-instance");
	}
	return privateMap.get(receiver).value;
}
function _classPrivateFieldSet(receiver, privateMap, value) {
	if (!privateMap.has(receiver)) {
		throw new TypeError("attempted to set private field on non-instance");
	}
	var descriptor = privateMap.get(receiver);
	if (!descriptor.writable) {
		throw new TypeError("attempted to set read only private field");
	}
	descriptor.value = value;
	return value;
}
function _classPrivateMethodGet(receiver, privateSet, fn) {
	if (!privateSet.has(receiver)) {
		throw new TypeError("attempted to get private field on non-instance");
	}
	return fn;
}
if (typeof Array.prototype.at !== "function") {
	Array.prototype.at = function(index) {
		return index < 0 ? this[this.length - Math.abs(index)] : this[index];
	};
}
if (typeof setImmediate === "undefined") {
	window.setImmediate = (callback) => setTimeout(callback, 0)
	;
}
const Events = {
	CREATE: "CREATE",
	LENGTH_CHANGE: "LENGTH_CHANGE",
	PUSH: "PUSH",
	LOADED: "LOADED"
};
var _Webpack;
const Webpack1 = (_Webpack = window.Webpack) !== null && _Webpack !== void 0 ? _Webpack : window.Webpack = new (function() {
	var _parseOptions = new WeakSet();
	class Webpack {
		get Events() {
			return Events;
		}
		get chunkName() {
			return "webpackChunkdiscord_app";
		}
		get id() {
			return "kernel-req" + Math.random().toString().slice(2, 5);
		}
		dispatch(event4, ...args1) {
			if (!(event4 in _classPrivateFieldGet(this, _events)))
				throw new Error(`Unknown Event: ${event4}`);
			for (const callback of _classPrivateFieldGet(this, _events)[event4]) {
				try {
					callback(...args1);
				} catch (err) {
					console.error(err);
				}
			}
		}
		on(event1, callback) {
			if (!(event1 in _classPrivateFieldGet(this, _events)))
				throw new Error(`Unknown Event: ${event1}`);
			return _classPrivateFieldGet(this, _events)[event1].add(callback), () => this.off(event1, callback);
		}
		off(event2, callback1) {
			if (!(event2 in _classPrivateFieldGet(this, _events)))
				throw new Error(`Unknown Event: ${event2}`);
			return _classPrivateFieldGet(this, _events)[event2].delete(callback1);
		}
		once(event3, callback2) {
			const unlisten = this.on(event3, (...args) => {
				unlisten();
				callback2(...args);
			});
		}
		async waitFor(filter3, {forever =false, retries =100, all, delay =100} = {
			}) {
			for (let i = 0; i < retries || forever; i++) {
				const module = this.findModule(filter3, all, false);
				if (module) return module;
				await new Promise((res) => setTimeout(res, delay)
				);
			}
		}
		request(cache = true) {
			if (cache && _classPrivateFieldGet(this, _cache)) return _classPrivateFieldGet(this, _cache);
			let req = void 0;
			if ("webpackChunkdiscord_app" in window && webpackChunkdiscord_app != null) {
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
			_classPrivateFieldSet(this, _cache, req);
			return req;
		}
		findModule(filter1, {all: all1 = false, cache: cache1 = true} = {
			}) {
			const __webpack_require__ = this.request(cache1);
			const found = [];
			const wrapFilter = (module) => {
				try {
					return filter1(module);
				} catch (e) {
					return false;
				}
			};
			for (let i in __webpack_require__.c) {
				var m = __webpack_require__.c[i].exports;
				if ((typeof m == "object" || typeof m == "function") && wrapFilter(m)) found.push(m);
				if (m === null || m === void 0 ? void 0 : m.__esModule) {
					for (let j in m)
						if ((typeof m[j] == "object" || typeof m[j] == "function") && wrapFilter(m[j])) found.push(m[j]);
				}
			}
			return all1 ? found : found.at(0);
		}
		findModules(filter2) {
			return this.findModule(filter2, {
				all: true
			});
		}
		bulk(...options) {
			const [filters, {cache =true, wait =false, forever =false}] = _classPrivateMethodGet(this, _parseOptions, parseOptions).call(this, options);
			const found = new Array(filters.length);
			const searchFunction = wait ? this.waitFor : this.findModule;
			const returnValue = searchFunction.call(this, (module) => {
				const matches = filters.filter((filter) => {
					try {
						return filter(module);
					} catch (e) {
						return false;
					}
				});
				if (!matches.length) return false;
				for (const filter4 of matches) {
					found[filters.indexOf(filter4)] = module;
				}
				return true;
			}, {
				all: true,
				cache,
				forever
			});
			if (wait) return returnValue.then(() => found
				);
			return found;
		}
		findByProps(...options1) {
			const [props1, {bulk =false, cache =true, wait =false, forever =true}] = _classPrivateMethodGet(this, _parseOptions, parseOptions).call(this, options1);
			const filter = (props, module) => module && props.every((prop) => prop in module
			);
			return bulk ? this.bulk(...props1.map((props) => filter.bind(null, props)
			).concat({
				cache,
				wait
			})) : wait ? this.waitFor(filter.bind(null, props1)) : this.findModule(filter.bind(null, props1), false, cache);
		}
		findByDisplayName(...options2) {
			const [displayNames, {all =false, bulk =false, default: defaultExport = false, cache =true, wait =false, forever =false}] = _classPrivateMethodGet(this, _parseOptions, parseOptions).call(this, options2);
			const filter = (name, module) => {
				var ref;
				return defaultExport ? (module === null || module === void 0 ? void 0 : (ref = module.default) === null || ref === void 0 ? void 0 : ref.displayName) === name : (module === null || module === void 0 ? void 0 : module.displayName) === name;
			};
			return bulk ? this.bulk(...displayNames.map((name) => filter.bind(null, name)
			).concat({
				wait,
				cache
			})) : wait ? this.waitFor(filter.bind(null, displayNames[0]), {
				all
			}) : this.findModule(filter.bind(null, displayNames[0]), false, cache);
		}
		findByIndex(index, {cache: cache2 = true} = {
			}) {
			var ref;
			return (ref = this.request(cache2).c[index]) === null || ref === void 0 ? void 0 : ref.exports;
		}
		findIndex(filter5, {cache: cache3 = true} = {
			}) {
			const modules = this.request(cache3).c;
			const wrappedFilter = (module) => {
				try {
					return filter5(module);
				} catch (error) {
					return false;
				}
			};
			for (const index in modules) {
				if (!modules[index]) continue;
				const exports = modules[index].exports;
				if (!exports) continue;
				if (wrappedFilter(exports)) return index;
				if (exports.__esModule && exports.default && wrappedFilter(exports.default)) return index;
				if (exports.__esModule && typeof exports.default === "object") {
					for (const value of Object.values(exports.default)) {
						if (wrappedFilter(value)) return index;
					}
				}
			}
		}
		async wait(callback3) {
			return new Promise((resolve) => {
				this.once(Events.LOADED, () => {
					resolve();
					typeof callback3 === "function" && callback3();
				});
			});
		}
		get whenExists() {
			return new Promise((resolve) => {
				this.once(Events.CREATE, resolve);
			});
		}
		constructor() {
			_events.set(this, {
				writable: true,
				value: Object.fromEntries(Object.keys(Events).map((key) => [
					key,
					new Set()
				]
				))
			});
			_cache.set(this, {
				writable: true,
				value: null
			});
			_parseOptions.add(this);
			Object.defineProperty(window, this.chunkName, {
				get() {
					return void 0;
				},
				set: (value) => {
					setImmediate(() => {
						this.dispatch(Events.CREATE);
					});
					const originalPush = value.push;
					value.push = (...values) => {
						this.dispatch(Events.LENGTH_CHANGE, value.length + values.length);
						this.dispatch(Events.PUSH, values);
						return Reflect.apply(originalPush, value, values);
					};
					Object.defineProperty(window, this.chunkName, {
						value,
						configurable: true,
						writable: true
					});
					return value;
				},
				configurable: true
			});
			let listener = (shouldUnsubscribe, Dispatcher, ActionTypes, event) => {
				if ((event === null || event === void 0 ? void 0 : event.event) !== "app_ui_viewed") return;
				if (shouldUnsubscribe) {
					Dispatcher.unsubscribe(ActionTypes.TRACK, listener);
				}
				this.dispatch(Events.LOADED);
			};
			this.once(Events.CREATE, async () => {
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
				Dispatcher.subscribe(ActionTypes.TRACK, listener = listener.bind(null, true, Dispatcher, ActionTypes));
			});
			this.whenReady = this.wait();
		}
	}
	var _events = new WeakMap();
	var _cache = new WeakMap();
	function parseOptions(args, filter = (thing) => typeof thing === "object" && thing != null && !Array.isArray(thing)
	) {
		return [
			args,
			filter(args.at(-1)) ? args.pop() : {
			}
		];
	}
	return Webpack;
}());

class DiscordModules {
	/**@returns {typeof import("react")} */
	static get React() {
		return memoize(this, "React", () => Webpack1.findByProps("createElement", "createContext")
		);
	}
	/**@returns {typeof import("react-dom")} */
	static get ReactDOM() {
		return memoize(this, "ReactDOM", () => Webpack1.findByProps("findDOMNode", "render", "createPortal")
		);
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
		return memoize(this, "ModalsAPI", () => Webpack1.findByProps("openModal", "useModalsStore")
		);
	}
	static get ModalComponents() {
		return memoize(this, "ModalComponents", () => Webpack1.findByProps("ModalRoot", "ModalHeader")
		);
	}
	static get Forms() {
		return memoize(this, "Forms", () => Webpack1.findByProps("FormTitle", "FormItem")
		);
	}
	static get Button() {
		return memoize(this, "Button", () => Webpack1.findByProps("DropdownSizes")
		);
	}
	static get ConfirmationModal() {
		return memoize(this, "ConfirmationModal", () => Webpack1.findByDisplayName("ConfirmModal")
		);
	}
	/**@returns {typeof import("react")} */
	static get Text() {
		return memoize(this, "Text", () => Webpack1.findByDisplayName("Text")
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
					const tempReturn = beforePatch.callback(this, arguments, patch.originalFunction.bind(this));
					if (tempReturn != undefined)
						returnValue = tempReturn;
				} catch (error) {
					console.error("Patch:" + patch.functionName, error);
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
						if (tempReturn != undefined)
							returnValue = tempReturn;
					} catch (error) {
						console.error("Patch:" + patch.functionName, error);
					}
			}
			for (const afterPatch of patch.children.filter((e) => e.type === "after"
			)) {
				try {
					const tempReturn = afterPatch.callback(this, arguments, returnValue, (ret) => returnValue = ret
					);
					if (tempReturn != undefined)
						returnValue = tempReturn;
				} catch (error) {
					console.error("Patch:" + patch.functionName, error);
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
		module[functionName].originalFunction = patch.originalFunction;
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
 * @returns {[(factory = _ => _) => JSON.Element, Api]}
 */
function createStore(state) {
	const {useEffect, useReducer} = DiscordModules.React;
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
		const [, forceUpdate] = useReducer((e) => e + 1
			, 0);
		useEffect(() => {
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
	static show(content, options = {
		}) {
		// NotLikeThis
		setImmediate(() => {
			this.API.setState((state) => ({
				...state,
				id: Math.random().toString(36).slice(2),
				toasts: state.toasts.concat({
					content,
					timeout: 3000,
					...options
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
	static compile(filecontent, name) {
		return `((module, exports, __dirname, __filename, global) => {
${filecontent}
if (!module.exports || !module.exports.prototype) {module.exports = eval(${JSON.stringify(name)});}
})//# sourceURL=kernel://bd-compat/plugins/${name}.plugin.js`;
	}
	static resolve(idOrFileOrAddon) {
		return this.addons.find((addon) => addon.name === idOrFileOrAddon || addon.path === idOrFileOrAddon || addon === idOrFileOrAddon
		);
	}
	static loadAddon(location, showToast = true, showStart = true) {
		const filecontent = fs$1.readFileSync(location, "utf8");
		const meta = Utilities.parseMETA(filecontent);
		meta.filename = path.basename(location);
		meta.path = location;
		if (this.resolve(meta.name) || this.resolve(meta.filename))
			throw new Error(`There's already a plugin with name ${meta.name || meta.filename}!`);
		let exports = {
		};
		try {
			eval(this.compile(filecontent, meta.name))(exports, exports, path.dirname(location), location, window);
		} catch (error) {
			Logger.error("PluginsManager", `Failed to compile ${meta.name || path.basename(location)}:`, error);
		}
		meta.exports = exports.toString().split(" ")[0] === "class" ? exports : exports.__esModule ? exports.default || exports.exports.default : exports.exports;
		try {
			const instance = new meta.exports(meta);
			meta.instance = instance;
			if (typeof instance.load === "function") {
				try {
					instance.load(meta);
					Logger.log("PluginsManager", `${meta.name} was loaded!`);
					if (showToast) Toasts$1.show(`${meta.name} was loaded!`, {
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
			Toasts$1.show(`${addon.name} was unloaded!`, {
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
				Toasts$1.show(`${addon.name} has been started!`, {
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
				Toasts$1.show(`${addon.name} has been stopped!`, {
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
			Toasts$1.show(`${addon.name} has been enabled!`, {
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
			Toasts$1.show(`${addon.name} has been stopped!`, {
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
		Logger.log("PluginsManager", `${addon.name} was reloaded!`);
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
		if (showToast3) {
			Logger.log("ThemesManager", `${theme.name} has been removed!`);
			Toasts$1.show(`${theme.name} has been removed!`, {
				type: "info"
			});
		}
	}
	static reloadAddon(addon3) {
		const theme = this.resolve(addon3);
		if (!theme) return;
		this.removeTheme(theme, false);
		this.applyTheme(theme, false);
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
		return Webpack1.findModule(filter);
	}
	static findAllModules(filter1) {
		return Webpack1.findModules(filter1);
	}
	static findModuleByProps(...props) {
		return Webpack1.findByProps(...props);
	}
	static findModuleByDisplayName(displayName) {
		return Webpack1.findByDisplayName(displayName);
	}
	static findModuleByPrototypes(...protos) {
		return Webpack1.findModule((m) => typeof m === "function" && protos.every((proto) => proto in m.prototype
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
	static loadData(pluginName, key) {
		return DataStore.getPluginData(pluginName, key);
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

var electron = {
	shell: BDCompatNative.executeJS(`require("electron").shell`),
	clipboard: BDCompatNative.executeJS(`require("electron").clipboard`),
	ipcRenderer: BDCompatNative.executeJS(`Object.keys(require("electron").ipcRenderer)`).slice(3).reduce((newElectron, key) => {
		newElectron[key] = BDCompatNative.executeJS(`require("electron").ipcRenderer[${JSON.stringify(key)}].bind(require("electron").ipcRenderer)`);
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
    `);
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
    `);
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

var mimeTypes = BDCompatNative.executeJS(`require("mime-types")`);

var url = {
	parse: (...args) => BDCompatNative.executeJS(`
        __cloneObject(require("url").parse(${args.map((e) => JSON.stringify(e)
	).join(", ")}));
    `)
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
		if (_classStaticPrivateFieldSpecGet(this, Components, __cache)[name]) return _classStaticPrivateFieldSpecGet(this, Components, __cache)[name];
		_classStaticPrivateFieldSpecGet(this, Components, __cache)[name] = Webpack1.findModule((m) => props.every((p) => p in m
			) && typeof m === "function"
		);
		return _classStaticPrivateFieldSpecGet(this, Components, __cache)[name];
	}
	static get(name, filter = (_) => _
	) {
		if (_classStaticPrivateFieldSpecGet(this, Components, __cache)[name]) return _classStaticPrivateFieldSpecGet(this, Components, __cache)[name];
		_classStaticPrivateFieldSpecGet(this, Components, __cache)[name] = Webpack1.findModule((m) => m.displayName === name && filter(m)
		);
		return _classStaticPrivateFieldSpecGet(this, Components, __cache)[name];
	}
}
var __cache = {
	writable: true,
	value: {
	}
};

function Icon({name, ...props}) {
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
		className: "bdcompat-toolbutton",
		look: Button.Looks.BLANK,
		size: Button.Sizes.NONE,
		onClick: onClick,
		disabled
	}, React.createElement(Icon, {
		name: icon,
		color: danger ? "#ed4245" : void 0,
		width: 20,
		height: 20
	}))
	);
}
function ButtonWrapper({value, onChange, disabled}) {
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
function AddonCard({addon, manager, openSettings, hasSettings, type}) {
	const {React} = DiscordModules;
	const [, forceUpdate] = React.useReducer((n) => n + 1
		, 0);
	React.useEffect(() => {
		return manager.on("toggled", (name) => {
			if (name !== addon.name) return;
			forceUpdate();
		});
	}, [
		addon,
		manager
	]);
	return React.createElement("div", {
		className: "bdcompat-addon-card " + addon.name.replace(/ /g, "-"),
		children: [
			React.createElement("div", {
				className: "bdcompat-card-tools",
				children: [
					React.createElement(ToolButton, {
						label: "Settings",
						icon: "Gear",
						disabled: !hasSettings,
						onClick: openSettings
					}),
					React.createElement(ToolButton, {
						label: "Reload",
						icon: "Replay",
						onClick: () => manager.reloadAddon(addon)
					}),
					React.createElement(ToolButton, {
						label: "Open Path",
						icon: "Folder",
						onClick: () => {
							BDCompatNative.executeJS(`require("electron").shell.showItemInFolder(${JSON.stringify(addon.path)})`);
						}
					}),
					React.createElement(ToolButton, {
						label: "Delete",
						icon: "Trash",
						danger: true,
						onClick: () => {
							Modals.showConfirmationModal("Are you sure?", `Are you sure that you want to delete the ${type} "${addon.name}"?`, {
								onConfirm: () => {
									BDCompatNative.executeJS(`require("electron").shell.trashItem(${JSON.stringify(addon.path)})`);
								}
							});
						}
					})
				]
			}),
			React.createElement("div", {
				className: "bdcompat-card-header",
				children: [
					React.createElement("div", {
						className: "bdcompat-card-name"
					}, addon.name),
					"version" in addon && React.createElement("div", {
						className: "bdcompat-card-version"
					}, "v" + addon.version),
					"author" in addon && React.createElement("div", {
						className: "bdcompat-card-author"
					}, "by " + addon.author)
				]
			}),
			addon.description && React.createElement("div", {
				className: "bdcompat-card-desc"
			}, React.createElement(Components.get("Markdown", (e) => "rules" in e
			), null, addon.description)),
			React.createElement("div", {
				className: "bdcompat-footer",
				children: React.createElement(ButtonWrapper, {
					value: manager.isEnabled(addon),
					onChange: () => {
						manager.toggleAddon(addon);
					}
				})
			})
		]
	});
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
						onClick: () => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`)
					})
				]
			}),
			pluginSettings ? React.createElement(ErrorBoundary(), {
				children: pluginSettings.element
			}) : React.createElement("div", {
				className: "bdcompat-addon-panel-list"
			}, manager.addons.map((addon) => {
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
							element = addon.instance.getSettingsPanel();
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
							return void Toasts.show(`Unable to open settings panel fro ${addon.name}.`, {
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
			}))
		]
	});
}

function SettingsPanel() {
	return DiscordModules.React.createElement("div", {
		className: "bdcompat-settings-panel",
		children: [
			DiscordModules.React.createElement("div", {
				className: "bdcompat-title"
			}, "Settings"),
			DiscordModules.React.createElement("p", {
			}, "Settings :)")
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

/// <reference path="../../types.d.ts" />
const SettingsSections = [
	{
		section: "DIVIDER"
	},
	{
		section: "HEADER",
		label: "BDCompat"
	},
	{
		id: "bdcompat-settings-settings",
		section: "BDCompatSettings",
		label: "Settings",
		className: "bdcompat-settings-item-settings",
		element: () => DiscordModules.React.createElement(SettingsPanel, {
		})
	},
	{
		id: "bdcompat-settings-plugins",
		section: "BDCompatPlugins",
		label: "Plugins",
		className: "bdcompat-settings-item-plugins",
		element: () => DiscordModules.React.createElement(AddonPanel, {
			manager: PluginsManager,
			type: "plugin"
		})
	},
	{
		id: "bdcompat-settings-themes",
		section: "BDCompatThemes",
		label: "Themes",
		className: "bdcompat-settings-item-themes",
		element: () => DiscordModules.React.createElement(AddonPanel, {
			manager: ThemesManager,
			type: "theme"
		})
	}
];
var index = new class BDCompat {
	start() {
		Webpack1.whenReady.then(this.onStart.bind(this));
	}
	onStart() {
		this.polyfillWebpack();
		if (!Reflect.has(window, "__BDCOMPAT_LEAKED__")) {
			window.require = Require;
			window.Buffer = Buffer;
		}
		window.React = DiscordModules.React;
		this.exposeBdApi();
		this.patchSettingsView();
		DataStore.initialize();
		Toasts$1.initialize();
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
			}, Webpack1.request(false));
		};
	}
	appendStyles() {
		const root = BDCompatNative.executeJS(`require("path").resolve(__dirname, "..")`);
		for (const [index, style] of this.styles.entries()) {
			const location = path.resolve(root, "src", "renderer", style);
			if (!fs$1.existsSync(location)) return Logger.error("Styles", `The stylesheet at ${location} doesn't exists.`);
			DOM.injectCSS("BDCompat-internal" + index, fs$1.readFileSync(location, "utf8"));
		}
	}
	patchSettingsView() {
		const SettingsView = Webpack1.findByDisplayName("SettingsView");
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
			"./ui/addons.css"
		];
	}
};

export { index as default };
