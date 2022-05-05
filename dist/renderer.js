const methods = [["appendFile"], ["appendFileSync"], ["access"], ["accessSync"], ["chown"], ["chownSync"], ["chmod"], ["chmodSync"], ["close"], ["closeSync"], ["copyFile"], ["copyFileSync"], ["exists"], ["existsSync"], ["fchown"], ["fchownSync"], ["fchmod"], ["fchmodSync"], ["fdatasync"], ["fdatasyncSync"], ["fstat"], ["fstatSync"], ["fsync"], ["fsyncSync"], ["ftruncate"], ["ftruncateSync"], ["futimes"], ["futimesSync"], ["lchown"], ["lchownSync"], ["link"], ["linkSync"], ["lstat", e => ({
		...e,
		isDirectory() {
			return e.isDirectory()
		},
		isFile() {
			return e.isFile()
		}
	})], ["lstatSync", e => ({
		...e,
		isDirectory() {
			return e.isDirectory()
		},
		isFile() {
			return e.isFile()
		}
	})], ["lutimes"], ["lutimesSync"], ["mkdir"], ["mkdirSync"], ["mkdtemp"], ["mkdtempSync"], ["open"], ["openSync"], ["opendir"], ["opendirSync"], ["readdir"], ["readdirSync"], ["read"], ["readSync"], ["readv"], ["readvSync"], ["readFile"], ["readFileSync"], ["readlink"], ["readlinkSync"], ["realpath"], ["realpathSync"], ["rename"], ["renameSync"], ["rm"], ["rmSync"], ["rmdir"], ["rmdirSync"], ["stat", e => ({
		...e,
		isDirectory() {
			return e.isDirectory()
		},
		isFile() {
			return e.isFile()
		}
	})], ["statSync", e => ({
		...e,
		isDirectory() {
			return e.isDirectory()
		},
		isFile() {
			return e.isFile()
		}
	})], ["symlink"], ["symlinkSync"], ["truncate"], ["truncateSync"], ["unwatchFile"], ["unlink"], ["unlinkSync"], ["utimes"], ["utimesSync"], ["watch", e => ({
		...e,
		close: () => e.close()
	})], ["watchFile", e => ({
		...e,
		close: () => e.close()
	})], ["writeFile"], ["writeFileSync"], ["write"], ["writeSync"], ["writev"], ["writevSync"], ["writev"], ["writevSync"], ["F_OK"], ["R_OK"], ["W_OK"], ["X_OK"], ["constants"], ["promises", e => e.isFile ? {
		...e,
		isDirectory() {
			return e.isDirectory()
		},
		isFile() {
			return e.isFile()
		}
	} : e]],
	fs1 = (t => {
		var n = e => e;
		for (let e = 0; e < methods.length; e++) {
			const [s, r=n] = methods[e];
			var a = BDCompatNative.executeJS(`
            const factory = ${r.toString()};
            const method = require("fs")["${s}"];
            const override = (() => {
                if (typeof method === "function") return (...args) => factory(method(...args));
                if (typeof method === "object") {
                    const clone = {};
                    const keys = Object.keys(method);

                    for (let i = 0; i < keys.length; i++) {
                        clone[keys[i]] = typeof method[keys[i]] === "function" ? (...args) => {
                            const ret = method[keys[i]](...args);
                            if (ret instanceof Promise) return ret.then(ret => factory(ret));

                            return ret;
                        } : method[keys[i]];
                    }

                    return clone;
                }

                return method;
            })();
            override;
        `, (new Error).stack);
			t[s] = a
		}
		return t
	})({});
var path = "undefined" == typeof __BDCOMPAT_LEAKED__ ? BDCompatNative.executeJS("require(\"path\")", (new Error).stack) : window.require("path");
class Logger {
	static _parseType(e) {
		switch (e) {
			case "info":
			case "warn":
			case "error":
				return e;default:
				return "log"
		}
	}
	static _log(e, t, ...n) {
		e = this._parseType(e), console[e](`%c[BetterDiscord]%c %c[${t}]%c`, "color: #3e82e5; font-weight: 700;", "", "color: #3e82e5", "", ...n)
	}
	static log(e, ...t) {
		this._log("log", e, ...t)
	}
	static info(e, ...t) {
		this._log("info", e, ...t)
	}
	static warn(e, ...t) {
		this._log("warn", e, ...t)
	}
	static error(e, ...t) {
		this._log("error", e, ...t)
	}
}
class DataStore {
	static getAddonState(e) {
		try {
			return JSON.parse(fs1.readFileSync(path.resolve(this.dataFolder, e + "States.json"), "utf8"))
		} catch (e) {
			return {}
		}
	}
	static saveAddonState(e, t = {}) {
		try {
			fs1.writeFileSync(path.resolve(this.dataFolder, e + "States.json"), JSON.stringify(t, null, "\t"))
		} catch (e) {
			Logger.error("DataStore", "Unable to save addon states:", e)
		}
	}
	static initialize() {
		var e;
		Logger.log("DataStore", "Ensuring directories...");
		for (const n of ["config", "plugins", "themes"]) {
			var t = path.resolve(BDCompatNative.getBasePath(), n);
			if (!fs1.existsSync(t)) try {
					fs1.mkdirSync(t)
				} catch (e) {
					Logger.error("DataStore", `Failed to create missing ${n} folder:`, e)
			}
		}
		Logger.log("DataStore", "Loading settings...");try {
			fs1.existsSync(this.settingsFile) || fs1.writeFileSync(this.settingsFile, "{}", "utf8"), this.settingsData = null !== (e = this.loadData("settings")) && void 0 !== e ? e : {}
		} catch (e) {
			Logger.error("DataStore", "Failed to load settings:", e), this.settingsData = {}
		}
	}
	static tryLoadPluginData(t) {
		if (this.pluginData[t]) return this.pluginData[t];
		var e = path.join(this.pluginsFolder, t + ".config.json");
		try {
			if (!fs1.existsSync(e)) return null;
			this.pluginData[t] = this.loadData(t, this.pluginsFolder, ".config.json")
		} catch (e) {
			Logger.error("DataStore", `PluginData for ${t} seems corrupted.`, e)
		}
	}
	static saveData(e, t, n = DataStore.dataFolder, a = ".json") {
		try {
			fs1.writeFileSync(path.resolve(n, "" + e + a), JSON.stringify(t, null, "\t"), "utf8")
		} catch (e) {
			Logger.error("DataStore", "Failed to save data:", e)
		}
	}
	static loadData(e, t = DataStore.dataFolder, n = ".json") {
		try {
			return JSON.parse(fs1.readFileSync(path.resolve(t, "" + e + n), "utf8"))
		} catch (e) {
			Logger.error("DataStore", "Failed to load data:", e)
		}
	}
	static setPluginData(e, t, n) {
		t = Object.assign({}, this.pluginData[e], {
			[t]: n
		});this.pluginData[e] = t, this.saveData(e, t, this.pluginsFolder, ".config.json")
	}
	static getPluginData(e, t) {
		return this.pluginData[e] || this.tryLoadPluginData(e), null === (e = this.pluginData[e]) || void 0 === e ? void 0 : e[t]
	}
	static setSettings(e, t) {
		e = Object.assign({}, this.settingsData, {
			[e]: t
		});try {
			this.saveData("settings", e)
		} catch (e) {
			Logger.error("DataStore", "Failed to save settings:", e)
		}
	}
	static getSettings() {
		return this.settingsData
	}
	static deletePluginData(e, t) {
		var n,
			a;
		this.pluginData[e] || this.tryLoadPluginData(e), this.pluginData[e] && (void 0 !== (null === (n = this.pluginData[e]) || void 0 === n ? void 0 : n[t]) && null !== (a = this.pluginData[e]) && void 0 !== a &&
		delete a[t]
		, this.saveData(e, this.pluginData[e]))
	}
}
function memoize(e, t, n) {
	n = n();return Object.defineProperty(e, t, {
			value: n,
			configurable: !0
		}), n
}
function _classPrivateFieldGet(e, t) {
	if (!t.has(e))
		throw new TypeError("attempted to get private field on non-instance");
	return t.get(e).value
}
DataStore.pluginData = {}, DataStore.settingsData = null, DataStore.pluginsFolder = path.resolve(BDCompatNative.getBasePath(), "plugins"), DataStore.themesFolder = path.resolve(DataStore.pluginsFolder, "..", "themes"), DataStore.dataFolder = path.resolve(DataStore.pluginsFolder, "..", "config"), DataStore.settingsFile = path.resolve(DataStore.dataFolder, "settings.json"), "function" != typeof Array.prototype.at && Object.defineProperty(Array.prototype, "at", {
	value: function(e) {
		return e < 0 ? this[this.length - Math.abs(e)] : this[e]
	},
	enumerable: !1,
	configurable: !0
}), "undefined" == typeof setImmediate && (window.setImmediate = e => setTimeout(e, 0));
class Filters {
	static byProps(...e) {
		return t => e.every(e => e in t)
	}
	static byDisplayName(t, n = !1) {
		return e => (n ? e = e.default : e) && "function" == typeof e && e.displayName === t
	}
	static byTypeString(...n) {
		return t => {
			var e;
			return t.type && (t = null === (e = t.type) || void 0 === e ? void 0 : e.toString()) && n.every(e => -1 < t.indexOf(e))
		}
	}
}
class WebpackModule {
	get Filters() {
		return Filters
	}
	get chunkName() {
		return "webpackChunkdiscord_app"
	}
	get id() {
		return Symbol("pc-compat")
	}
	addListener(e) {
		return _classPrivateFieldGet(this, _listeners).add(e), () => {
				_classPrivateFieldGet(this, _listeners).delete(e)
		}
	}
	removeListener(e) {
		return _classPrivateFieldGet(this, _listeners).delete(e)
	}
	findLazy(a) {
		var e = this.findModule(a);
		return e ? Promise.resolve(e) : new Promise(t => {
			const n = this.addListener(e => {
				if (a(e)) return t(e), void n();
				e.default && a(e.default) && (t(e.default), n())
			})
		})
	}
	async waitFor(t, {retries: n=100, all: a=!1, forever: s=!1, delay: r=50} = {}) {
		for (let e = 0; e < n || s; e++) {
			var i = this.findModule(t, {
				all: a,
				cache: !1
			});
			if (i) return i;
			await new Promise(e => setTimeout(e, r))
		}
	}
	parseOptions(e, t = e => "object" == typeof e && null != e && !Array.isArray(e)) {
		return [e, t(e.at(-1)) ? e.pop() : {}]
	}
	request(e = 0) {
		return this.cache || (Array.isArray(window[this.chunkName]) && (t = [[this.id], {}, e => e], this.cache = webpackChunkdiscord_app.push(t), webpackChunkdiscord_app.splice(webpackChunkdiscord_app.indexOf(t), 1)), this.cache);
		var t
	}
	findModule(a, {all: e=!1, cache: t=!0, force: u=!1, default: h=!1} = {}) {
		if ("function" == typeof a) {
			var s = this.request(t);
			const c = [];
			let n = null;
			if (s) {
				function r(e, t) {
					try {
						return a(e, t)
					} catch (e) {
						return null !== n && void 0 !== n ? n : n = e, !1
					}
				}
				for (const l in s.c) {
					var i = s.c[l].exports;
					if (i && i !== window) switch (typeof i) {
							case "object":
								if (r(i, l)) {
									if (!e) return i;
									c.push(i)
								}
								if (i.__esModule && null != i.default && "number" != typeof i.default && r(i.default, l)) {
									var o = h ? i : i.default;
									if (!e) return o;
									c.push(o)
								}
								if (u && i.__esModule)
									for (const d in i)
										if (i[d] && r(i[d], l)) {
											if (!e) return i[d];
											c.push(i[d])
								}
								break;case "function":
								if (r(i, l)) {
									if (!e) return i;
									c.push(i)
								}
					}
				}
				return n && setImmediate(() => {
						console.warn("[Webpack] filter threw an error. This can cause lag spikes at the user's end. Please fix asap.\n\n", n)
					}), e ? c : c[0]
			}
		}
	}
	findModules(e) {
		return this.findModule(e, {
			all: !0
		})
	}
	bulk(...e) {
		const [a, {wait: t=!1, ...n}] = this.parseOptions(e),
			s = new Array(a.length),
			r = t ? this.waitFor : this.findModule,
			i = a.map(t => ("string" == typeof (t = Array.isArray(t) ? Filters.byProps(...t) : t) && (t = Filters.byDisplayName(t)), e => {
					try {
						return t(e)
					} catch (e) {
						return !1
					}
				})),
			o = r.call(this, t => {
				for (let e = 0; e < i.length; e++) {
					const n = i[e];
					"function" == typeof n && n(t) && null == s[e] && (s[e] = t)
				}
				return s.filter(String).length === a.length
			}, n);
		return t ? o.then(() => s) : s
	}
	findByProps(...e) {
		const [t, {bulk: n=!1, wait: a=!1, ...s}] = this.parseOptions(e);
		return n || a ? a && !n ? this.waitFor(Filters.byProps(...t), s) : n ? (e = t.map(e => Filters.byProps(...e)).concat({
			wait: a,...s
		}), this.bulk(...e)) : null : this.findModule(Filters.byProps(...t), s)
	}
	findByDisplayName(...e) {
		const [t, {bulk: n=!1, wait: a=!1, ...s}] = this.parseOptions(e);
		if (!n && !a) return this.findModule(Filters.byDisplayName(t[0]), s);
		if (a && !n) return this.waitFor(Filters.byDisplayName(t[0]), s);
		if (n) {
			const r = t.map(r.map(Filters.byDisplayName)).concat({
				wait: a,
				cache: cache
			});
			return this.bulk(...r)
		}
		return null
	}
	findIndex(n) {
		let a = -1;
		return this.findModule((e, t) => {
				n(e) && (a = t)
			}), a
	}
	atIndex(e) {
		var t;
		return null === (t = this.request(!0)) || void 0 === t ? void 0 : t.c[e]
	}
	get waitForGlobal() {
		return new Promise(async e => {
			for (; !Array.isArray(window[this.chunkName]);) await new Promise(setImmediate);
			e()
		})
	}
	async wait(e = null) {
		return this.whenReady.then(() => {
			"function" == typeof e && e()
		})
	}
	get whenExists() {
		return this.waitForGlobal
	}
	on(e, t) {
		if ("LOADED" === e) return this.whenReady.then(t)
	}
	get once() {
		return this.on
	}
	constructor() {
		_listeners.set(this, {
			writable: !0,
			value: new Set
		}), this.cache = null, this.whenReady = this.waitForGlobal.then(() => new Promise(async e => {
			const [t, {ActionTypes:n} ={}, a] = await this.findByProps(["dirtyDispatch"], ["API_HOST", "ActionTypes"], ["getCurrentUser", "_dispatchToken"], {
				cache: !1,
				bulk: !0,
				wait: !0,
				forever: !0
			});
			if (a.getCurrentUser()) return e();
			function s() {
				t.unsubscribe(n.START_SESSION, s), t.unsubscribe(n.CONNECTION_OPEN, s), e()
			}
			t.subscribe(n.START_SESSION, s), t.subscribe(n.CONNECTION_OPEN, s)
		})), this.whenReady.then(() => {
			let s = window[this.chunkName].push;
			const t = e => {
				const [, t] = e;
				for (const n in t) {
					const a = t[n];
					t[n] = (...e) => {
						var [, t] = e;
						try {
							a.apply(a, e);const n = [..._classPrivateFieldGet(this, _listeners)];
							for (let e = 0; e < n.length; e++) try {
									n[e](t)
								} catch (e) {
									console.error("[Webpack]", "Could not fire callback listener:", e)
							}
						} catch (e) {
							console.error(e)
						}
					}, Object.assign(t[n], a, {
						toString: a.toString.bind(a),
						__original: a
					})
				}
				return s.apply(window[this.chunkName], [e])
			};
			Object.defineProperty(window[this.chunkName], "push", {
				configurable: !0,
				get: () => t,
				set: e => {
					s = e, Object.defineProperty(window[this.chunkName], "push", {
						value: t,
						configurable: !0,
						writable: !0
					})
				}
			})
		})
	}
}
var _listeners = new WeakMap;
const Webpack = new WebpackModule;
class DiscordModules {
	static get React() {
		return memoize(this, "React", () => Webpack.findByProps("createElement", "createContext"))
	}
	static get ReactDOM() {
		return memoize(this, "ReactDOM", () => Webpack.findByProps("findDOMNode", "render", "createPortal"))
	}
	static get Tooltips() {
		return memoize(this, "Tooltips", () => Webpack.findByProps("TooltipContainer"))
	}
	static get DiscordProviders() {
		return memoize(this, "DiscordProviders", () => {
			const [{AccessibilityPreferencesContext: {Provider:e}} ={
					AccessibilityPreferencesContext: {}
				}, t, {LayerClassName:n} ={}] = Webpack.findByProps(["AccessibilityPreferencesContext"], ["AppReferencePositionLayer"], ["LayerClassName"], {
				bulk: !0
			});
			return {
				AccessibilityProvider: e,
				LayerProvider: t.AppLayerProvider().props.layerContext.Provider,
				container: document.querySelector("#app-mount > ." + n)
			}
		})
	}
	static get Toasts() {
		return memoize(this, "Toasts", () => Object.assign({}, ...Webpack.findByProps(["createToast"], ["showToast"], {
			bulk: !0
		})))
	}
	static get PrivateChannelActions() {
		return memoize(this, "PrivateChannelActions", () => Webpack.findByProps("openPrivateChannel"))
	}
	static get Dispatcher() {
		return memoize(this, "Dispatcher", () => Webpack.findByProps("dirtyDispatch"))
	}
	static get InviteActions() {
		return memoize(this, "InviteActions", () => Webpack.findByProps("resolveInvite"))
	}
	static get ContextMenu() {
		return memoize(this, "ContextMenu", () => {
			var e,
				[t, n] = Webpack.findByProps(["openContextMenu"], ["MenuItem", "default"], {
					bulk: !0
				});
			const a = {
				open: t.openContextMenu,
				close: t.closeContextMenu,
				Menu: n.default
			};
			for (e in n) e.startsWith("Menu") && (a[e.slice("Menu".length)] = n[e]);
			return a
		})
	}
}
class DOM {
	static get head() {
		return memoize(this, "head", () => document.head.appendChild(this.createElement("bd-head")))
	}
	static createElement(e, t, ...n) {
		const a = Object.assign(document.createElement(e), t);
		return a.append(...n), a
	}
	static injectCSS(e, t) {
		e = this.createElement("style", {
			id: e,
			textContent: t
		});return this.head.appendChild(e), e
	}
	static clearCSS(e) {
		const t = this.head.querySelector(`style[id="${e}"]`);
		t && t.remove()
	}
}
class Modals {
	static get ModalsAPI() {
		return memoize(this, "ModalsAPI", () => Webpack.findByProps("openModal", "useModalsStore"))
	}
	static get ModalComponents() {
		return memoize(this, "ModalComponents", () => Webpack.findByProps("ModalRoot", "ModalHeader"))
	}
	static get Forms() {
		return memoize(this, "Forms", () => Webpack.findByProps("FormTitle", "FormItem"))
	}
	static get Button() {
		return memoize(this, "Button", () => Webpack.findByProps("DropdownSizes"))
	}
	static get ConfirmationModal() {
		return memoize(this, "ConfirmationModal", () => Webpack.findByDisplayName("ConfirmModal"))
	}
	static get Text() {
		return memoize(this, "Text", () => Webpack.findByDisplayName("Text"))
	}
	static showConfirmationModal(t, n, e = {}) {
		const {confirmText: a="Okay", cancelText: s="Cancel", onConfirm: r=() => {}, onCancel: i=() => {}} = e;
		return this.ModalsAPI.openModal(e => DiscordModules.React.createElement(this.ConfirmationModal, Object.assign({
			header: t,
			confirmText: a,
			cancelText: s,
			onConfirm: r,
			onCancel: i
		}, e), DiscordModules.React.createElement(this.Text, null, n)))
	}
	static alert(e, t) {
		return this.showConfirmationModal(e, t, {
			cancelText: null
		})
	}
}
class Patcher {
	static getPatchesByCaller(e) {
		if (!e) return [];
		const t = [];
		for (const n of this._patches)
			for (const a of n.children) a.caller === e && t.push(a);
		return t
	}
	static unpatchAll(e) {
		e = this.getPatchesByCaller(e);
		if (e.length)
			for (const t of e) t.unpatch()
	}
	static makeOverride(o) {
		return function() {
			let t;
			if (null == o || (null === (e = o.children) || void 0 === e || !e.length)) return o.originalFunction.apply(this, arguments);
			for (const s of o.children.filter(e => "before" === e.type)) try {
					s.callback(this, arguments)
				} catch (e) {
					Logger.error("Patcher", `Cannot fire before patch of ${o.functionName} for ${s.caller}:`, e)
			}
			var e = o.children.filter(e => "instead" === e.type);
			if (e.length)
				for (const r of e) try {
						var n = r.callback(this, arguments, o.originalFunction.bind(this));
						void 0 !== n && (t = n)
					} catch (e) {
						Logger.error("Patcher", `Cannot fire before patch of ${o.functionName} for ${r.caller}:`, e)
			} else
				t = o.originalFunction.apply(this, arguments);
			for (const i of o.children.filter(e => "after" === e.type)) try {
					var a = i.callback(this, arguments, t, e => t = e);
					void 0 !== a && (t = a)
				} catch (e) {
					Logger.error("Patcher", `Cannot fire before patch of ${o.functionName} for ${i.caller}:`, e)
			} return t
		}
	}
	static pushPatch(e, t, n) {
		const a = {
			caller: e,
			module: t,
			functionName: n,
			originalFunction: t[n],
			undo: () => {
				a.module[a.functionName] = a.originalFunction, a.children = []
			},
			count: 0,
			children: []
		};
		return t[n] = this.makeOverride(a), Object.assign(t[n], a.originalFunction, {
				__originalFunction: a.originalFunction
			}), this._patches.push(a), a
	}
	static doPatch(e, t, n, a, s = "after", r = {}) {
		var i,
			r = r["displayName"];
		const o = null !== (i = this._patches.find(e => e.module === t && e.functionName === n)) && void 0 !== i ? i : this.pushPatch(e, t, n),
			c = ("string" != typeof r && (r || t.displayName || t.name || t.constructor.displayName || t.constructor.name), {
				caller: e,
				type: s,
				id: o.count,
				callback: a,
				unpatch: () => {
					var e;
					o.children.splice(o.children.findIndex(e => e.id === c.id && e.type === s), 1), o.children.length <= 0 && (e = this._patches.findIndex(e => e.module == t && e.functionName == n), this._patches[e].undo(), this._patches.splice(e, 1))
				}
			});
		return o.children.push(c), o.count++, c.unpatch
	}
	static before(e, t, n, a) {
		return this.doPatch(e, t, n, a, "before")
	}
	static after(e, t, n, a) {
		return this.doPatch(e, t, n, a, "after")
	}
	static instead(e, t, n, a) {
		return this.doPatch(e, t, n, a, "instead")
	}
}
Patcher._patches = [];
var Toasts$1 = {
		settings: [{
			name: "Show Toasts",
			note: "Show any types of toasts.",
			value: !0,
			id: "showToasts",
			type: "switch"
		}, {
			name: "Use builtin toasts",
			note: "Makes BDCompat use discord's builtin toasts instead.",
			value: !0,
			id: "useBuiltinToasts",
			type: "switch"
		}, {
			name: "Show Toasts on",
			type: "category",
			requires: ["showToasts"],
			items: [{
				name: "Show Toasts on plugin start/stop",
				id: "showToastsPluginStartStop",
				type: "switch",
				value: !0
			}, {
				name: "Show Toasts on plugin load/unload",
				id: "showToastsPluginLoad",
				type: "switch",
				value: !0
			}, {
				name: "Show Toasts on plugin reload",
				id: "showToastsPluginReload",
				type: "switch",
				value: !0
			}, {
				name: "Show Toasts on plugin enable/disable",
				id: "showToastsPluginState",
				type: "switch",
				value: !0
			}]
		}]
	},
	Developer = {
		settings: [{
			name: "Show Debug Logs",
			note: "",
			value: !1,
			id: "showDebug",
			type: "switch"
		}]
	},
	defaultSettings = {
		Toasts: Toasts$1,
		Developer: Developer
	};
class SettingsManager {
	static get items() {
		return defaultSettings
	}
	static initialize() {
		this.states = DataStore.getSettings();
		const a = (e, t = []) => {
			for (const n of e) "category" !== n.type ? this.settings[n.id] = {
					type: n.type,
					get value() {
						var e;
						return null !== (e = SettingsManager.states[n.id]) && void 0 !== e ? e : n.value
					},
					requires: t
				} : a(n.items, n.requires)
		};
		for (var e in this.defaultSettings) {
			e = this.defaultSettings[e];e.settings && a(e.settings)
		}
	}
	static setSetting(e, t) {
		this.states[e] = t, DataStore.setSettings(e, t), this.alertListeners(e, t)
	}
	static isEnabled(e) {
		const t = this.settings[e];
		return !!t && (t.value && t.requires.every(e => this.isEnabled(e)))
	}
	static addListener(e) {
		return this.listeners.add(e), () => this.removeListener(e)
	}
	static removeListener(e) {
		return this.listeners.delete(e)
	}
	static alertListeners(...e) {
		for (const t of this.listeners) try {
				t(...e)
			} catch (e) {
				Logger.error("SettingsManager", "Could not fire listener:", e)
		}
	}
	static useState(e) {
		const [t, n] = React.useState(e());
		return React.useEffect(() => this.addListener(() => n(e()))), t
	}
}
function Toast({type:e, children:t, timeout:n, onRemove:a}) {
	const s = DiscordModules["React"],
		[r, i] = s.useState(!1),
		o = s.useCallback(() => {
			i(!0), setTimeout(() => a(), 300)
		}, [a, r]);
	return s.useEffect(() => {
			setTimeout(() => o(), n)
		}, [n]), s.createElement("div", {
			className: ["bd-toast", e && ["icon", "toast-" + e], r && "closing"].filter(Boolean).flat(10).join(" "),
			onClick: e => {
				e.shiftKey && o()
			}
		}, t)
}
function ToastsContainer({useStore:e, setState:t}) {
	const a = DiscordModules["React"],
		n = e(e => e.toasts);
	return a.createElement(a.Fragment, null, n.map(n => a.createElement(Toast, {
		key: n.id,
		onRemove: () => {
			t(e => {
				var t = e.toasts.indexOf(n);
				if (!(t < 0)) return {
						...e,
						toasts: e.toasts.slice(0, t).concat(e.toasts.slice(t + 1))
				}
			})
		},
		children: n.content,
		timeout: n.timeout,
		type: n.type
	})))
}
function createStore(t) {
	const n = new Set,
		a = Object.freeze({
			get listeners() {
				return n
			},
			getState(e = e => e) {
				return e(t)
			},
			setState(e) {
				e = "function" == typeof e ? e(t) : e;_.isEqual(t, e) || (t = Object.assign({}, t, e), n.forEach(e => {
					e(t)
				}))
			},
			addListener(e) {
				if (!n.has(e)) return n.add(e), () => n.delete(e)
			},
			removeListener(e) {
				return n.delete(e)
			}
		});
	function e(e = e => e) {
		const [, t] = DiscordModules.React.useReducer(e => e + 1, 0);
		return DiscordModules.React.useEffect(() => {
				const e = () => t();
				return n.add(e), () => n.delete(e)
			}, []), a.getState(e)
	}
	return Object.assign(e, a, {
			*[Symbol.iterator]() {
				yield e, yield a
			}
		}), e
}
SettingsManager.listeners = new Set, SettingsManager.defaultSettings = defaultSettings, SettingsManager.states = {}, SettingsManager.settings = {};
class Converter {
	static convertType(e) {
		switch (
		null == e ? void 0 : e.toLowerCase()) {
			case "info":
				return DiscordModules.Toasts.ToastType.MESSAGE;case "error":
				return DiscordModules.Toasts.ToastType.FAILURE;case "success":
				return DiscordModules.Toasts.ToastType.SUCCESS;default:
				return DiscordModules.Toasts.ToastType.MESSAGE
		}
	}
}
class Toasts {
	static dispose() {
		return DiscordModules.ReactDOM.unmountComponentAtNode(this.container)
	}
	static get container() {
		return memoize(this, "container", () => DOM.createElement("div", {
			className: "bd-toasts"
		}))
	}
	static initialize() {
		var [e, t] = createStore({
			toasts: []
		});
		document.body.appendChild(this.container), this.API = t, DiscordModules.ReactDOM.render(DiscordModules.React.createElement(ToastsContainer, {
			useStore: e,
			setState: t.setState
		}), this.container)
	}
	static showDiscordToast(t, n) {
		try {
			return void setImmediate(() => {
				var e = Converter.convertType(n.type),
					e = DiscordModules.Toasts.createToast(t, e);
				DiscordModules.Toasts.showToast(e)
			})
		} catch (e) {
			Logger.error("Toasts", "Failed to show discord's toast:", e)
		}
	}
	static show(t, n = {}) {
		if (SettingsManager.isEnabled("showToasts")) return SettingsManager.isEnabled("useBuiltinToasts") ? this.showDiscordToast(t, n) : void this.API.setState(e => ({
				...e,
				id: Math.random().toString(36).slice(2),
				toasts: e.toasts.concat({
					content: t,
					timeout: 3e3,...n
				})
			}))
	}
}
class Utilities {
	static parseMETA(e) {
		const [t] = e.split("\n");
		if (t.startsWith("//META")) return this.parseOldMETA(e);
		if (t.startsWith("/**")) return this.parseNewMETA(e);
		throw new Error("META was not found!")
	}
	static parseOldMETA(e) {
		const [t] = e.split("\n"),
			n = JSON.parse(t.slice(t.indexOf("//META") + 6, t.indexOf("*//")));
		return n.format = "json", n
	}
	static parseNewMETA(e) {
		const t = e.split("/**", 2)[1].split("*/", 1)[0],
			n = {
				format: "jsdoc"
			};
		let a = "",
			s = "";
		for (const i of t.split(this.metaSplitRegex)) {
			var r;
			i.length && ("@" === i[0] && " " !== i[1] ? (n[a] = s, r = i.indexOf(" "), a = i.slice(1, r), s = i.slice(r + 1)) : s += " " + i.replace("\\n", "\n").replace(this.escapeAtRegex, "@"))
		}
		return n[a] = s.trim(),
			delete n[""]
			, n
	}
	static joinClassNames(...e) {
		let t = [];
		for (const s of e) {
			var n,
				a;
			"string" != typeof s ? Array.isArray(s) && ([n, a] = s, n && t.push(a)) : t.push(s)
		}
		return t.join(" ")
	}
}
Utilities.metaSplitRegex = /[^\S\r\n]*?\r?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/, Utilities.escapeAtRegex = /^\\@/;
const showDebug = () => SettingsManager.isEnabled("showDebug"),
	startTimes = {};
class PluginsManager {
	static on(e, t) {
		return this.listeners[e] || (this.listeners[e] = new Set), this.listeners[e].add(t), this.off.bind(this, e, t)
	}
	static off(e, t) {
		if (this.listeners[e]) return this.listeners[e].delete(t)
	}
	static dispatch(e, ...t) {
		if (this.listeners[e])
			for (const n of this.listeners[e]) try {
					n(...t)
				} catch (e) {
					Logger.error("Emitter", e)
		}
	}
	static initialize() {
		this.addonState = DataStore.getAddonState("plugins"), this.observer = new MutationObserver(e => {
			for (const t of e) this.onMutate(t)
		}), this.observer.observe(document, {
			childList: !0,
			subtree: !0
		}), BDCompatNative.IPC.on("navigate", () => this.onSwitch()), Logger.log("PluginsManager", "Loading plugins..."), this.loadAllPlugins(), this.watchAddons()
	}
	static watchAddons() {
		this.watcher = fs1.watch(this.folder, {
			persistent: !1
		}, (e, t) => {
			if (e && t) {
				var n = path.resolve(this.folder, t);
				if (t.endsWith(this.extension)) try {
						const a = fs1.statSync(n);
						if (!a.isFile() || !a.mtime) return;
						if (this.times[t] === a.mtime.getTime()) return;
						this.times[t] = a.mtime.getTime(), "rename" === e && this.loadAddon(n, !0), "change" === e && this.reloadAddon(n, !0)
					} catch (e) {
						if (fs1.existsSync(n)) return;
						this.unloadAddon(n, !0)
				}
			}
		})
	}
	static loadAllPlugins() {
		var t = fs1.readdirSync(this.folder, "utf8");
		for (let e = 0; e < t.length; e++) {
			const a = t[e];
			var n = path.resolve(this.folder, a);
			const s = fs1.statSync(n);
			if (a.endsWith(this.extension) && s.isFile()) {
				this.times[a] = s.mtime.getTime();try {
					this.loadAddon(n, !1), this.dispatch("updated")
				} catch (e) {
					Logger.error("PluginsManager", `Failed to load plugin ${a}:`, e)
				}
			}
		}
		showDebug() && (Logger.log("PluginsManager", "Plugins start times:"), console.table(startTimes))
	}
	static compile(e, t, n) {
		return `(function (module, exports, __dirname, __filename, global) {
${e}
if (module.exports["${t}"]) {module.exports = module.exports["${t}"];}
if (!module.exports || !module.exports.prototype) {module.exports = eval(${JSON.stringify(t)});}
})
//# sourceURL=` + _.escape(n)
	}
	static resolve(t) {
		return this.addons.find(e => e.name === t || e.path === t || e === t)
	}
	static loadAddon(t, e = !0, n = !0) {
		var a = Date.now(),
			s = fs1.readFileSync(t, "utf8");
		const r = Utilities.parseMETA(s);
		if (Object.assign(r, {
				filename: path.basename(t),
				path: t,
				filecontent: s
			}), this.resolve(r.name) || this.resolve(r.filename))
			throw new Error(`There's already a plugin with name ${r.name || r.filename}!`);
		var i = {
			exports: {}
		};
		try {
			window.eval(this.compile(s, r.name, t))(i, i.exports, path.dirname(t), t, window)
		} catch (e) {
			Logger.error("PluginsManager", `Failed to compile ${r.name || path.basename(t)}:`, e)
		}
		if (r.exports = "function" == typeof i.exports ? i.exports : null !== (s = i.exports) && void 0 !== s && s.__esModule ? i.exports.default || i.exports.exports.default : i.exports.exports, "function" != typeof r.exports)
			throw "Plugin had no exports.";
		try {
			const o = new r.exports(r);
			if ("function" == typeof (r.instance = o).load) try {
					o.load(r), e && SettingsManager.isEnabled("showToastsPluginLoad") && Toasts.show(r.name + " was loaded!", {
						type: "success"
					})
				} catch (e) {
					Logger.error("PluginsManager", `Unable to fire load() for ${r.name || r.filename}:`, e)
			} r.version || "function" != typeof o.getVersion || (r.version = o.getVersion()), r.description || "function" != typeof o.getDescription || (r.description = o.getDescription()), r.author || "function" != typeof o.getAuthor || (r.author = "" + o.getAuthor()), null == this.addonState[r.name] && (this.addonState[r.name] = !1, DataStore.saveAddonState("plugins", this.addonState)), this.addons.push(r), this.addonState[r.name] && this.startPlugin(r, n), this.dispatch("updated")
		} catch (e) {
			return void Logger.error("PluginsManager", `Unable to load ${r.name || r.filename}:`, e)
		} finally {
			return showDebug() && (startTimes[r.name] = {
					"time in ms": Math.round(Date.now() - a)
				}), r.instance
		}
	}
	static unloadAddon(e, t = !0) {
		e = this.resolve(e);e && (this.stopPlugin(e, !1), this.addons.splice(this.addons.indexOf(e), 1), t && (Logger.log("PluginsManager", e.name + " was unloaded!"), SettingsManager.isEnabled("showToastsPluginLoad") && Toasts.show(e.name + " was unloaded!", {
			type: "info"
		})), this.dispatch("updated"))
	}
	static delete(e) {
		e = this.resolve(e);
		if (e) return fs1.unlinkSync(e.path)
	}
	static startPlugin(e, t = !0) {
		const n = this.resolve(e);
		if (n) {
			try {
				"function" == typeof n.instance.start && n.instance.start(), t && SettingsManager.isEnabled("showToastsPluginStartStop") && Toasts.show(n.name + " has been started!", {
					type: "info"
				})
			} catch (e) {
				return Logger.error("PluginsManager", `Unable to fire start() for ${n.name}:`, e), Toasts.show(n.name + " could not be started!", {
						type: "error"
					}), !1
			} return !0
		}
	}
	static stopPlugin(e, t = !0) {
		const n = this.resolve(e);
		if (n) {
			try {
				"function" == typeof n.instance.stop && n.instance.stop(), t && (Logger.log("PluginsManager", n.name + " has been stopped!"), SettingsManager.isEnabled("showToastsPluginStartStop") && Toasts.show(n.name + " has been stopped!", {
					type: "info"
				}))
			} catch (e) {
				return Logger.error("PluginsManager", `Unable to fire stop() for ${n.name}:`, e), Toasts.show(n.name + " could not be stopped!", {
						type: "error"
					}), !1
			} return !0
		}
	}
	static isEnabled(e) {
		var e = this.resolve(e);
		if (e) return null !== (e = this.addonState[e.name]) && void 0 !== e && e
	}
	static enableAddon(e) {
		e = this.resolve(e);
		if (!e) return Logger.warn("PluginsManager", "Unable to enable plugin that isn't loaded!");
		if (this.isEnabled(e)) return Logger.warn("PluginsManager", "Cannot enable addon twice!");
		var t = this.startPlugin(e, !1);
		t && (Logger.log("PluginsManager", e.name + " has been enabled!"), SettingsManager.isEnabled("showToastsPluginState") && Toasts.show(e.name + " has been enabled!", {
			type: "info"
		})), this.addonState[e.name] = t, DataStore.saveAddonState("plugins", this.addonState), this.dispatch("toggle", e.name, t)
	}
	static disableAddon(e) {
		e = this.resolve(e);return e ? this.isEnabled(e) ? (this.stopPlugin(e, !1) && (Logger.log("PluginsManager", e.name + " has been stopped!"), SettingsManager.isEnabled("showToastsPluginState") && Toasts.show(e.name + " has been stopped!", {
			type: "info"
		})), this.addonState[e.name] = !1, DataStore.saveAddonState("plugins", this.addonState), void this.dispatch("toggle", e.name, !1)) : Logger.warn("PluginsManager", "Cannot disable addon twice!") : Logger.warn("PluginsManager", "Unable to disable non-loaded addon!")
	}
	static toggleAddon(e) {
		e = this.resolve(e);
		this.isEnabled(e) ? this.disableAddon(e) : this.enableAddon(e)
	}
	static reloadAddon(e) {
		e = this.resolve(e);this.unloadAddon(e, !1), this.loadAddon(e.path, !1, !1), Toasts.show(e.name + " was reloaded!", {
			type: "success"
		}), SettingsManager.isEnabled("showToastsPluginReload") && Logger.log("PluginsManager", e.name + " was reloaded!")
	}
	static onSwitch() {
		for (const t of this.addons)
			if ("function" == typeof t.instance.onSwitch && this.isEnabled(t)) try {
					t.instance.onSwitch()
				} catch (e) {
					Logger.error("PluginsManager", `Unable to fire onSwitch() for ${t.name}:`, e)
		}
	}
	static onMutate(e) {
		for (const t of this.addons)
			if ("function" == typeof t.instance.observer && this.isEnabled(t)) try {
					t.instance.observer(e)
				} catch (e) {
					Logger.error("PluginsManager", `Unable to fire observer() for ${t.name}:`, e)
		}
	}
}
PluginsManager.listeners = {}, PluginsManager.folder = DataStore.pluginsFolder, PluginsManager.extension = ".plugin.js", PluginsManager.addons = [], PluginsManager.times = {};
class ThemesManager {
	static on(e, t) {
		return this.listeners[e] || (this.listeners[e] = new Set), this.listeners[e].add(t), this.off.bind(this, e, t)
	}
	static off(e, t) {
		if (this.listeners[e]) return this.listeners[e].delete(t)
	}
	static dispatch(e, ...t) {
		if (this.listeners[e])
			for (const n of this.listeners[e]) try {
					n(...t)
				} catch (e) {
					Logger.error("Emitter", e)
		}
	}
	static initialize() {
		this.addonState = DataStore.getAddonState("themes"), Logger.log("ThemesManager", "Loading themes..."), this.loadAllThemes(), this.watchAddons()
	}
	static resolve(t) {
		return this.addons.find(e => e.id === t || e.name === t || e.path === t || e === t)
	}
	static isEnabled(e) {
		var e = this.resolve(e);
		if (e) return null !== (e = this.addonState[e.name]) && void 0 !== e && e
	}
	static watchAddons() {
		let s = new Date;
		this.watcher = fs1.watch(this.folder, {
			persistent: !1
		}, (e, t) => {
			if (e && t && !(new Date - s < 100)) {
				s = new Date;
				var n = path.resolve(this.folder, t);
				if (t.endsWith(this.extension)) try {
						const a = fs1.statSync(n);
						if (!a.isFile() || !a.mtime) return;
						if (this.times[t] === a.mtime.getTime()) return;
						this.times[t] = a.mtime.getTime(), "rename" == e && this.loadTheme(n, !0), "change" == e && this.reloadAddon(n, !0)
					} catch (e) {
						if (fs1.existsSync(n)) return;
						this.unloadAddon(n, !0)
				}
			}
		})
	}
	static loadAllThemes() {
		for (const t of fs1.readdirSync(this.folder, "utf8")) {
			var e = path.resolve(this.folder, t);
			const n = fs1.statSync(e);
			if (t.endsWith(this.extension) && n.isFile()) {
				this.times[t] = n.mtime.getTime();try {
					this.loadTheme(e, !1), this.dispatch("updated")
				} catch (e) {
					Logger.error("ThemesManager", `Failed to load ${t}:`, e)
				}
			}
		}
	}
	static loadTheme(e, t = !0) {
		var n = fs1.readFileSync(e, "utf8");
		const a = Utilities.parseMETA(n);
		if (a.filename = path.basename(e), a.path = e, a.css = n, this.resolve(a.name))
			throw new Error(`A theme with name ${a.name} already exists!`);
		return this.addons.push(a), a.name in this.addonState || (this.addonState[a.name] = !1, DataStore.saveAddonState("themes", this.addonState)), this.addonState[a.name] && this.applyTheme(a, t), this.dispatch("updated"), a
	}
	static unloadAddon(e, t = !0) {
		const n = this.resolve(e);
		n && (this.removeTheme(n, !1),
		delete n.css
		, this.addons.splice(this.addons.indexOf(n), 1), t && (Logger.log("ThemesManager", n.name + " was unloaded!"), Toasts.show(n.name + " was unloaded!", {
			type: "info"
		})), this.dispatch("updated"))
	}
	static delete(e) {
		e = this.resolve(e);
		if (e) return fs1.unlinkSync(e.path)
	}
	static applyTheme(e, t = !0) {
		const n = this.resolve(e);
		n && (n.element = DOM.injectCSS(n.name + "theme", n.css), t && (Toasts.show(n.name + " has been applied!", {
			type: "success"
		}), Logger.log("ThemesManager", n.name + " has been applied!")))
	}
	static removeTheme(e, t = !0) {
		const n = this.resolve(e);
		n && n.element && DOM.head.contains(n.element) && (n.element.remove(),
		delete n.element
		, t && (Logger.log("ThemesManager", n.name + " has been removed!"), Toasts.show(n.name + " has been removed!", {
			type: "info"
		})))
	}
	static reloadAddon(e) {
		e = this.resolve(e);e && this.isEnabled(e) && (this.unloadAddon(e, !1), this.loadTheme(e.path, !1), Logger.log("ThemesManager", e.name + " was reloaded!"), Toasts.show(e.name + " was reloaded!", {
			type: "success"
		}))
	}
	static enableAddon(e) {
		e = this.resolve(e);e && !this.isEnabled(e) && (this.applyTheme(e, !1), Logger.log("ThemesManager", e.name + " has been enabled!"), Toasts.show(e.name + " has been applied."), this.addonState[e.name] = !0, DataStore.saveAddonState("themes", this.addonState), this.dispatch("toggled", e.name, !0))
	}
	static disableAddon(e) {
		e = this.resolve(e);e && this.isEnabled(e) && (this.removeTheme(e, !1), Logger.log("ThemesManager", e.name + " has been removed!"), Toasts.show(e.name + " has been removed.", {
			type: "info"
		}), this.addonState[e.name] = !1, DataStore.saveAddonState("themes", this.addonState), this.disableAddon("toggled", e.name, !1))
	}
	static toggleAddon(e) {
		this.resolve(e) && (this.isEnabled(e) ? this.disableAddon(e) : this.enableAddon(e))
	}
}
ThemesManager.folder = DataStore.themesFolder, ThemesManager.extension = ".theme.css", ThemesManager.listeners = {}, ThemesManager.addons = [], ThemesManager.times = {};
const createAddonAPI = n => new class {
	get folder() {
		return n.folder
	}
	isEnabled(e) {
		return n.isEnabled(e)
	}
	enable(e) {
		return n.enableAddon(e)
	}
	disable(e) {
		return n.disableAddon(e)
	}
	toggle(e) {
		return n.toggleAddon(e)
	}
	reload(e) {
		return n.reloadAddon(e)
	}
	get(e) {
		return n.resolve(e)
	}
	getAll() {
		return n.addons.map(e => this.get(e))
	}
	on(e, t) {
		return n.on(e, t)
	}
	off(e, t) {
		return n.off(e, t)
	}
	delete(e) {
		return n.delete(e)
	}
};
class BdApi {
	static get version() {
		return "0.0.0"
	}
	static get React() {
		return DiscordModules.React
	}
	static get ReactDOM() {
		return DiscordModules.ReactDOM
	}
	static get WindowConfigFile() {
		return ""
	}
	static get settings() {
		return []
	}
	static isSettingEnabled() {
		return !0
	}
	static disableSetting() {}
	static enableSetting() {}
	static __getPluginConfigPath(e) {
		return path.resolve(this.Plugins.folder, "..", "config", e + ".json")
	}
	static injectCSS(e, t) {
		return DOM.injectCSS(e, t)
	}
	static clearCSS(e) {
		return DOM.clearCSS(e)
	}
	static alert(e, t) {
		return Modals.alert(e, t)
	}
	static showConfirmationModal(e, t, n) {
		return Modals.showConfirmationModal(e, t, n)
	}
	static showToast(e, t) {
		return Toasts.show(e, t)
	}
	static findModule(e) {
		return Webpack.findModule(e)
	}
	static findAllModules(e) {
		return Webpack.findModules(e)
	}
	static findModuleByProps(...e) {
		return Webpack.findByProps(...e)
	}
	static findModuleByDisplayName(e) {
		return Webpack.findByDisplayName(e)
	}
	static findModuleByPrototypes(...e) {
		return Webpack.findModule(t => "function" == typeof t && e.every(e => e in t.prototype))
	}
	static getInternalInstance(e) {
		return null == e ? void 0 : e.__reactFiber$
	}
	static suppressErrors(t, n) {
		return (...e) => {
			try {
				return t(...e)
			} catch (e) {
				Logger.error("SuppressErrors", n, e)
			}
		}
	}
	static testJSON(e) {
		try {
			return JSON.parse(e)
		} catch (e) {
			return !1
		}
	}
	static loadData(e, t) {
		return DataStore.getPluginData(e, t)
	}
	static saveData(e, t, n) {
		return DataStore.setPluginData(e, t, n)
	}
	static deleteData(e, t) {
		return DataStore.deletePluginData(e, t)
	}
	static get getData() {
		return this.loadData
	}
	static get setData() {
		return this.saveData
	}
	static monkeyPatch(e, o, t) {
		const {before:n, after:a, instead:s, once: c=!1} = t,
			l = [];
		t = (s, r) => {
			const i = {
				originalMethod: e[o],
				callOriginalMethod: () => Reflect.apply(i.originalMethod, i.thisObject, i.methodArguments)
			};
			l.push(i.cancelPatch = Patcher[s]("BDCompatPatch-monkeyPatch", e, o, (e, t, n) => {
				i.thisObject = e, i.methodArguments = t, i.returnValue = n;try {
					var a = Reflect.apply(r, null, [i]);
					return c && i.cancelPatch(), a
				} catch (e) {
					Logger.error("BdApi.monkeyPatch", `Error in the ${s} callback of ${o}:`, e)
				}
			}))
		};return "function" == typeof n && t("before", n), "function" == typeof a && t("after", a), "function" == typeof s && t("instead", s), () => {
				for (const e of l) e()
		}
	}
	static onRemoved(s, r) {
		return new MutationObserver((e, t) => {
			for (const n of e)
				for (const a of n.removedNodes) (a === s || a.contains(s)) && (t.disconnect(), r())
		}).observe(document, {
			childList: !0,
			subtree: !0
		})
	}
}
BdApi.Plugins = createAddonAPI(PluginsManager), BdApi.Themes = createAddonAPI(ThemesManager), BdApi.Patcher = {
	patch(e, t, n, a, s) {
		return "string" != typeof e ? Logger.error("BdApi.Patcher", "Parameter 0 of patch must be a string representing the caller") : ["after", "before", "instead"].includes(s.type) ? Logger.error("BdApi.Patcher", `options.type must be one of (before | after | instead). Received ${s.type}.`) : Patcher[s.type](e, t, n, a)
	},
	getPatchesByCaller(e) {
		return "string" != typeof e ? Logger.error("BDCompat", `Argument "caller" must be a typeof string. Received ${typeof e} instead`) : Patcher.getPatchesByCaller(e)
	},
	unpatchAll(e) {
		return "string" != typeof e ? Logger.error("BDCompat", `Argument "caller" must be a typeof string. Received ${typeof e} instead`) : Patcher.unpatchAll(e)
	},...Object.fromEntries(["before", "after", "instead"].map(s => [s, function(e, t, n, a) {
				return Patcher[s](e, t, n, a)
	}]))
}, Object.defineProperties(BdApi, Reflect.ownKeys(BdApi).slice(2).reduce((e, t) => ("prototype" === t || (e[t] = Object.assign({}, Object.getOwnPropertyDescriptor(BdApi, t), {
		enumerable: !0
	})), e), {}));
var electron = {
	shell: BDCompatNative.executeJS("require(\"electron\").shell", (new Error).stack),
	clipboard: BDCompatNative.executeJS("require(\"electron\").clipboard", (new Error).stack),
	ipcRenderer: BDCompatNative.executeJS("Object.keys(require(\"electron\").ipcRenderer)", (new Error).stack).slice(3).reduce((e, t) => (e[t] = BDCompatNative.executeJS(`require("electron").ipcRenderer[${JSON.stringify(t)}].bind(require("electron").ipcRenderer)`, (new Error).stack), e), {})
};
class EventEmitter {
	static get EventEmitter() {
		return EventEmitter
	}
	setMaxListeners() {}
	on(e, t) {
		this.events[e] || (this.events[e] = new Set), this.events[e].add(t)
	}
	emit(t, ...e) {
		if (this.events[t])
			for (var [n, a] of this.events[t].entries()) try {
					a(...e)
				} catch (e) {
					Logger.error("Emitter", `Cannot fire listener for event ${t} at position ${n}:`, e)
		}
	}
	off(e, t) {
		if (this.events[e]) return this.events[e].delete(t)
	}
	constructor() {
		this.events = {}
	}
}
const Buffer$1 = {};
function setBuffer(e) {
	Object.assign(Buffer$1, e)
}
class RequestResponse extends Response {
	get headers() {
		return this._res.headers
	}
	get url() {
		return this._url
	}
	get type() {
		return this._type
	}
	get statusCode() {
		return this._res.statusCode
	}
	get status() {
		return this.statusCode
	}
	get ok() {
		return 200 <= this.status && this.status <= 299
	}
	constructor({res:e, body:t, url:n, type:a}) {
		super(t, {
			statusText: e.statusMessage,
			status: e.status
		}), this._res = e, this._url = n, this._type = a
	}
}
try {
	BDCompatNative.executeJS(`
        window.__REQUEST_RES_RET__ = [
            "request", 
            "headers", 
            "body", 
            "statusCode",
            "rawHeaders",
            "statusMessage",
            "url",
            "complete"
        ];
    `)
} catch (e) {
	console.error("[BDCompat] Fatal Error: Could not define request properties:", e)
}
const makeRequest$1 = BDCompatNative.executeJS((({url:e, options:t, method:n}, s) => {
		const a = require("request");
		return (n ? a[n] : a)(e, t, (e, t, n) => {
			var a = Object.fromEntries(__REQUEST_RES_RET__.map(e => [e, null == t ? void 0 : t[e]]));
			s(e, a, n)
		})
	}).toString(), (new Error).stack),
	request1$1 = function(a, e, s, r = "") {
		return "function" == typeof e && (s = e), makeRequest$1({
				url: a,
				options: e,
				method: r
			}, (e, t, n) => {
				n instanceof Uint8Array && (n = Buffer$1.Buffer.from(n));
				t = new RequestResponse({
					body: n,
					res: t,
					url: a,
					type: r.toLowerCase() || "default"
				});s(e, t, n)
			})
	};
Object.assign(request1$1, Object.fromEntries(["get", "put", "post", "delete", "head", "del"].map(a => [a, function(e, t, n) {
	return request1$1(e, t, n, a)
}])));
class Request extends EventEmitter {
	end() {
		this._req.end()
	}
	_setData(e) {
		Object.assign(this, e)
	}
	constructor(e) {
		this._req = null, this._req = e
	}
}
const makeRequest = BDCompatNative.executeJS(((e, t = {}, s) => {
	const n = require("https").get(e, t, n => {
		for (const a of ["data", "end", "close"]) n.on(a, (...e) => {
				if ("end" === a) {
					const t = ["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders", "end"];
					s("end", Object.fromEntries(t.map(e => [e, n[e]])))
				} else s(a, e)
			})
	});
	return {
		end() {
			n.end()
		}
	}
}).toString(), (new Error).stack);
function get(e, t, n) {
	"function" == typeof t && (n = t, t = {});
	e = makeRequest(e, t, (e, t) => {
		"end" === e && (a._setData(t), t = void 0), "data" === e && t[0] instanceof Uint8Array && (t[0].toString = () => String.fromCharCode(...t[0])), a.emit(e, ...t)
	});const a = new Request(e);
	return n(a), a
}
function request1() {
	return Reflect.apply(get, this, arguments)
}
const deserialize = function({props:t, name:e}) {
		const n = {
			[Symbol.toStringTag]: e
		};
		for (let e = 0; e < t.length; e++) {
			const [a, s, r] = t[e];
			"function" != typeof (n[a] = s) || Object.isFrozen(s) || Object.defineProperty(n[a], "toString", {
				configurable: !0,
				enumerable: !1,
				writable: !0,
				value: () => r})
		}
		return n
	},
	__createServer__native = (e => {
		function n(s) {
			var e;
			return {
				props: function(e) {
					const t = [];
					for (const n in e) "_" !== n.charAt(0) && t.push(n);
					return t
				}(s).map(e => {
					var t;
					let n = "function" == typeof s[e] ? s[e].bind(s) : s[e];
					if ("end" === e) {
						const a = n;
						n = e => (e && e instanceof Uint8Array && (e = Buffer. from (e)), a.call(s, e))
					}
					return [e, n, null !== (t = null === (e = s[e]) || void 0 === e || null === (t = e.toString) || void 0 === t ? void 0 : t.call(e)) && void 0 !== t ? t : ""]
				}),
				name: null !== (e = s[Symbol.toStringTag]) && void 0 !== e ? e : s.constructor.name
			}
		}
		let a = () => {};
		const t = require("http")["Server"];
		e = new t(e, (e, t) => {
			a(n(e), n(t))
		});return {
			props: n(e),
			tag: e.constructor.name,
			nativeHandle(e) {
				a = e
			}
		}
	}).toString();
function createServer(e, n) {
	"function" == typeof e && (n = e, e = {});const t = BDCompatNative.executeJS(`(${__createServer__native})` + `(${JSON.stringify(e)})`, (new Error).stack);
	return t.nativeHandle((e, t) => {
			n(deserialize(e), deserialize(t))
		}), deserialize(t.props)
}
var https = Object.freeze({
		__proto__: null,
		get: get,
		request: request1,
		createServer: createServer
	}),
	mimeTypes = BDCompatNative.executeJS(`(() => {
try {
    return require("mime-types");
} catch {
    return {};
}
})()`, (new Error).stack),
	url = {
		parse: (...e) => BDCompatNative.executeJS(`
        __cloneObject(require("url").parse(${e.map(e => JSON.stringify(e)).join(", ")}));
    `, (new Error).stack)
	};
const os = BDCompatNative.executeJS("require(\"os\")");
function Require(e) {
	switch (e) {
		case "fs":
			return fs1;case "path":
			return path;case "request":
			return request1$1;case "process":
			return process;case "electron":
			return electron;case "events":
			return EventEmitter;case "http":
		case "https":
			return https;case "mime-types":
			return mimeTypes;case "url":
			return url;case "os":
			return os;case "buffer":
			return Buffer$1;default:
			console.warn(e + " was not found!")
	}
}
function _classStaticPrivateFieldSpecGet(e, t, n) {
	if (e !== t)
		throw new TypeError("Private static access of wrong provenance");
	return n.value
}
class Components {
	static byProps(...e) {
		var t = e.join(":");
		return _classStaticPrivateFieldSpecGet(this, Components, _cache)[t] || (_classStaticPrivateFieldSpecGet(this, Components, _cache)[t] = Webpack.findModule(t => e.every(e => e in t) && "function" == typeof t)), _classStaticPrivateFieldSpecGet(this, Components, _cache)[t]
	}
	static get(t, n = e => e) {
		return _classStaticPrivateFieldSpecGet(this, Components, _cache)[t] || (_classStaticPrivateFieldSpecGet(this, Components, _cache)[t] = Webpack.findModule(e => e.displayName === t && n(e))), _classStaticPrivateFieldSpecGet(this, Components, _cache)[t]
	}
	static bulk(e, ...t) {
		return _classStaticPrivateFieldSpecGet(this, Components, _cache)[e] || (_classStaticPrivateFieldSpecGet(this, Components, _cache)[e] = Webpack.bulk(...t.map(n => "string" == typeof n ? e => e.displayName === n && "function" == typeof e : Array.isArray(n) ? t => n.every(e => e in t) : n))), _classStaticPrivateFieldSpecGet(this, Components, _cache)[e]
	}
}
var _cache = {
	writable: !0,
	value: {}
};
function _extends$b() {
	return (_extends$b = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function ColorPalette(e) {
	return React.createElement("svg", _extends$b({
		xmlns: "http://www.w3.org/2000/svg",
		height: "16",
		viewBox: "0 0 24 24",
		width: "16",
		fill: "currentColor"
	}, e), React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), React.createElement("path", {
		d: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
	}))
}
function _extends$a() {
	return (_extends$a = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function Extension(e) {
	return React.createElement("svg", _extends$a({
		xmlns: "http://www.w3.org/2000/svg",
		height: "16",
		viewBox: "0 0 24 24",
		width: "16",
		fill: "currentColor"
	}, e), React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), React.createElement("path", {
		d: "M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"
	}))
}
function _extends$9() {
	return (_extends$9 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function Globe(e) {
	return React.createElement("svg", _extends$9({
		xmlns: "http://www.w3.org/2000/svg",
		height: "24",
		viewBox: "0 0 24 24",
		width: "24",
		fill: "currentColor"
	}, e), React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), React.createElement("path", {
		d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"
	}))
}
function _extends$8() {
	return (_extends$8 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function Github(e) {
	return React.createElement("svg", _extends$8({
		width: "24",
		height: "24",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 496 512"
	}, e), React.createElement("path", {
		fill: "currentColor",
		d: "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
	}))
}
function _extends$7() {
	return (_extends$7 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function Help(e) {
	return React.createElement("svg", _extends$7({
		xmlns: "http://www.w3.org/2000/svg",
		height: "24",
		viewBox: "0 0 24 24",
		width: "24",
		fill: "currentColor"
	}, e), React.createElement("path", {
		d: "M0 0h24v24H0z",
		fill: "none"
	}), React.createElement("path", {
		d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
	}))
}
function _extends$6() {
	return (_extends$6 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function Donate(e) {
	return React.createElement("svg", _extends$6({
		xmlns: "http://www.w3.org/2000/svg",
		height: "24",
		viewBox: "0 0 24 24",
		width: "24",
		fill: "currentColor"
	}, e), React.createElement("g", null, React.createElement("rect", {
		fill: "none",
		height: "24",
		width: "24"
	})), React.createElement("g", null, React.createElement("path", {
		d: "M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12.88,17.76V19h-1.75v-1.29 c-0.74-0.18-2.39-0.77-3.02-2.96l1.65-0.67c0.06,0.22,0.58,2.09,2.4,2.09c0.93,0,1.98-0.48,1.98-1.61c0-0.96-0.7-1.46-2.28-2.03 c-1.1-0.39-3.35-1.03-3.35-3.31c0-0.1,0.01-2.4,2.62-2.96V5h1.75v1.24c1.84,0.32,2.51,1.79,2.66,2.23l-1.58,0.67 c-0.11-0.35-0.59-1.34-1.9-1.34c-0.7,0-1.81,0.37-1.81,1.39c0,0.95,0.86,1.31,2.64,1.9c2.4,0.83,3.01,2.05,3.01,3.45 C15.9,17.17,13.4,17.67,12.88,17.76z"
	})))
}
function _extends$5() {
	return (_extends$5 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function Patreon(e) {
	return React.createElement("svg", _extends$5({
		width: "24",
		height: "24",
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 512 512"
	}, e), React.createElement("path", {
		fill: "currentColor",
		d: "M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z"
	}))
}
const [useUpdaterStore, UpdaterApi] = createStore({
	updates: {}
});
function _extends$4() {
	return (_extends$4 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function Icon1({name:e, ...t}) {
	e = Components.get(e);return Components ? React.createElement(e, t) : null
}
function ToolButton({label:e, icon:t, onClick:n, danger: a=!1, disabled: s=!1}) {
	const r = Components.byProps("DropdownSizes");
	return React.createElement(Components.get("Tooltip"), {
		text: e,
		position: "top"
	}, e => React.createElement(r, {
		...e,
		className: Utilities.joinClassNames("bd-toolbutton", [a, "bd-danger"]),
		look: r.Looks.BLANK,
		size: r.Sizes.NONE,
		onClick: n,
		disabled: s
	}, React.createElement(Icon1, {
		name: t,
		width: 20,
		height: 20
	})))
}
function ButtonWrapper({value:e, onChange:t, disabled: n=!1}) {
	const a = DiscordModules["React"],
		[s, r] = a.useState(e);
	return a.createElement(Components.get("Switch"), {
		checked: s,
		disabled: n,
		onChange: () => {
			t(!s), r(!s)
		}
	})
}
function ClickableName({addon:e}) {
	var t;
	function a() {
		if (e.authorId) return DiscordModules.PrivateChannelActions.ensurePrivateChannel(e.authorId).then(() => {
				DiscordModules.PrivateChannelActions.openPrivateChannel(e.authorId)
			}).catch(() => {});
		window.open(e.authorLink, "_blank")
	}
	const s = React.useMemo(() => null != e.authorId || null != e.authorLink, [e]) ? "a" : "span";
	return React.createElement("div", {
		className: "bd-addon-author"
	}, React.createElement("span", {
		className: "bd-author-text"
	}, " by "), null !== (t = null === (t = e.author) || void 0 === t ? void 0 : t.split(/\s?,\s?/).map((e, t, n) => React.createElement(React.Fragment, {
		key: e
	}, React.createElement(s, {
		className: "bd-link",
		onClick: a
	}, e), t < n.length - 1 && React.createElement("span", {
			className: "bd-comma"
		}, ", ")))) && void 0 !== t ? t : "Unknown")
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
function SupportIcons({addon:r}) {
	async function i() {
		try {
			var e = await DiscordModules.InviteActions.resolveInvite(r.invite);
			DiscordModules.Dispatcher.dispatch({
				type: "INVITE_MODAL_OPEN",
				code: r.invite,
				invite: e,
				context: "APP"
			})
		} catch (e) {
			Logger.error("InviteManager", `Failed to resolve invite for ${r.name}:`, e), Toasts.show("Could not resolve invite.", {
				type: "error"
			})
		}
	}
	const o = Components.byProps("DropdownSizes");
	return React.createElement(React.Fragment, null, Object.entries(IconsMap).map(([t, e]) => {
		if (!r[t]) return null;
		function n() {
			window.open(r[t])
		}
		const {icon:a, label:s} = e;
		return React.createElement(DiscordModules.Tooltips.default, {
			text: s,
			position: "top",
			key: t
		}, e => React.createElement(o, _extends$4({}, e, {
			look: o.Looks.BLANK,
			size: o.Sizes.NONE,
			onClick: "invite" === t ? i : n,
			className: "bd-addon-support-button"
		}), React.createElement(a, {
			width: "20",
			height: "20"
		})))
	}))
}
function AddonCard({addon:t, manager:e, openSettings:n, hasSettings:a, type:s}) {
	const r = DiscordModules["React"],
		[, i] = r.useReducer(e => e + 1, 0);
	var o,
		c = Components.get("Markdown", e => "rules" in e);
	const l = useUpdaterStore(e => e.updates[t.name]);
	return r.useEffect(() => e.on("toggled", e => {
			e === t.name && i()
		}), [t, e]), React.createElement("div", {
			className: Utilities.joinClassNames("bd-addon-card"),
			"data-addon": t.name
		}, React.createElement("div", {
			className: "bd-addoncard-header"
		}, React.createElement("div", {
			className: "bd-addoncard-info"
		}, React.createElement("div", {
			className: "bd-addoncard-icon"
		}, "theme" === s ? React.createElement(ColorPalette, null) : React.createElement(Extension, null)), React.createElement("div", {
			className: "bd-addon-name"
		}, null !== (o = t.name) && void 0 !== o ? o : "???"), React.createElement("span", {
			className: "bd-addon-version"
		}, "v" + (null !== (o = t.version) && void 0 !== o ? o : "Unknown")), React.createElement(ClickableName, {
			addon: t
		})), React.createElement(ButtonWrapper, {
			value: e.isEnabled(t),
			onChange: () => {
				e.toggleAddon(t)
			}
		})), React.createElement("div", {
			className: "bd-addon-description"
		}, React.createElement(c, null, null !== (o = t.description) && void 0 !== o ? o : `This ${s} has no description specified.`)), React.createElement("div", {
			className: "bd-addon-footer"
		}, React.createElement("div", {
			className: "bd-support-bar"
		}, React.createElement(SupportIcons, {
			addon: t
		})), React.createElement("div", {
			className: "bd-toolbar"
		}, l && React.createElement(ToolButton, {
				label: "Download Update",
				icon: "Download",
				onClick: () => l.update()
			}), React.createElement(ToolButton, {
				label: "Settings",
				icon: "Gear",
				disabled: !a || !e.isEnabled(t),
				onClick: n
			}), React.createElement(ToolButton, {
				label: "Reload",
				icon: "Replay",
				onClick: () => e.reloadAddon(t)
			}), React.createElement(ToolButton, {
				label: "Open Path",
				icon: "Folder",
				onClick: () => {
					BDCompatNative.executeJS(`require("electron").shell.showItemInFolder(${JSON.stringify(t.path)})`, (new Error).stack)
				}
			}), React.createElement(ToolButton, {
				danger: !0,
				label: "Delete",
				icon: "Trash",
				onClick: () => {
					Modals.showConfirmationModal("Are you sure?", `Are you sure that you want to delete the ${s} "${t.name}"?`, {
						onConfirm: () => {
							BDCompatNative.executeJS(`require("electron").shell.trashItem(${JSON.stringify(t.path)})`, (new Error).stack)
						}
					})
				}
			}))))
}
function DOMWrapper({children:e}) {
	const t = DiscordModules.React.useRef();
	return DiscordModules.React.useEffect(() => {
			t.current && t.current.appendChild(e)
		}, [t, e]), DiscordModules.React.createElement("div", {
			className: "react-wrapper",
			ref: t
		})
}
var ErrorBoundary = () => {
	class e extends React.Component {
		static getDerivedStateFromError(e) {
			return {
				hasError: !0
			}
		}
		componentDidCatch(e, t) {
			console.error(e, t)
		}
		render() {
			return this.state.hasError ? DiscordModules.React.createElement("span", {
				style: {
					color: "red"
				}
			}, "There was an error.") : this.props.children
		}
		constructor(e) {
			super(e), this.state = {
				hasError: !1
			}
		}
	}
	return e
};
let Boundary = null;
function AddonPanel({type:a, manager:n}) {
	const s = DiscordModules["React"],
		[, e] = (null !== Boundary && void 0 !== Boundary ? Boundary : Boundary = ErrorBoundary(), s.useReducer(e => e + 1, 0)),
		[t, r] = s.useState(null);
	var i = Components.byProps("DropdownSizes"),
		o = Components.get("Caret"),
		c = Components.get("FormNotice"),
		d = Components.get("Arrow"),
		l = useUpdaterStore(e => {
			const t = [];
			for (const n in e.updates) e.updates[n].type === a && t.push(n);
			return t
		});
	const u = new Intl.ListFormat(document.documentElement.lang, {
		style: "long",
		type: "conjunction"
	});
	return s.useEffect(() => n.on("updated", () => e()), [a, n, t, e]), React.createElement("div", {
			className: "bdc-addon-panel " + a
		}, React.createElement("div", {
			className: "bdc-title"
		}, t && React.createElement(i, {
				size: i.Sizes.NONE,
				look: i.Looks.BLANK,
				onClick: () => r(null)
			}, React.createElement(d, {
				direction: "LEFT"
			})), React.createElement("span", {
				className: "bdc-FlexCenter"
			}, a[0].toUpperCase() + a.slice(1), "s - ", n.addons.length, t && React.createElement("span", {
					className: "bdc-FlexCenter"
				}, React.createElement(o, {
					direction: o.Directions.RIGHT,
					className: "bdc-settings-caret"
				}), t.name)), !t && React.createElement(ToolButton, {
				label: "Open Folder",
				icon: "Folder",
				onClick: () => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(n.folder)})`, (new Error).stack)
			})), t ? React.createElement(Boundary, null, t.element) : React.createElement("div", {
			className: "bdc-addon-list"
		}, l.length ? React.createElement(c, {
			key: "update-notice",
			type: c.Types.BRAND,
			className: "marginBottom20",
			title: "Outdated " + (a[0].toUpperCase() + a.slice(1)) + (1 < l.length ? "s" : ""),
			imageData: {
				src: "/assets/6e97f6643e7df29b26571d96430e92f4.svg",
				width: 60,
				height: 60
			},
			body: React.createElement(s.Fragment, null, `The following ${a}${1 < l.length ? "s" : ""} needs to be updated:`, React.createElement("br", null), u.format(l))
		}) : null, n.addons.map(t => {
			var e;
			return React.createElement(AddonCard, {
				key: t.name,
				addon: t,
				manager: n,
				type: a,
				hasSettings: "function" == typeof (null === (e = t.instance) || void 0 === e ? void 0 : e.getSettingsPanel),
				openSettings: () => {
					let e;
					try {
						e = t.instance.getSettingsPanel.apply(t.instance, [])
					} catch (e) {
						return Logger.error("Modals", `Cannot show addon settings modal for ${t.name}:`, e), void Toasts.show(`Unable to open settings panel for ${t.name}.`, {
								type: "error"
							})
					}
					if (Element.prototype.isPrototypeOf(e) ? e = s.createElement(DOMWrapper, {
							children: e
						}) : "function" == typeof e && (e = s.createElement(e, {})), !e) return Logger.error("Modals", "Unable to find settings panel for " + t.name), void Toasts.show(`Unable to open settings panel for ${t.name}.`, {
								type: "error"
							});
					e && r({
						name: t.name,
						element: e
					})
				}
			})
		})))
}
function _extends$3() {
	return (_extends$3 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function ChannelCategory(e) {
	return React.createElement("svg", _extends$3({
		width: "16",
		height: "16",
		viewBox: "0 0 16 16",
		xmlns: "http://www.w3.org/2000/svg"
	}, e), React.createElement("path", {
		transform: "translate(2.000000, 2.000000)",
		fillRule: "nonzero",
		fill: "currentColor",
		d: "M4,0 L4,3 L0,3 L0,0 L4,0 Z M12,4 L12,7 L8,7 L8,4 L12,4 Z M8,9 L12,9 L12,12 L8,12 L8,9.33333333 L8,9 Z M7,7 L3,7 L3,10 L7,10 L7,12 L3,12 L1,12 L1,4 L3,4 L3,5 L7,5 L7,7 Z"
	}))
}
function _extends$2() {
	return (_extends$2 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function SwitchItem({id:e, name:t, ...n}) {
	var a = Components.get("SwitchItem");
	const s = SettingsManager.useState(() => SettingsManager.isEnabled(e));
	return React.createElement(a, _extends$2({}, n, {
		value: s,
		onChange: () => {
			SettingsManager.setSetting(e, !s)
		}
	}), t)
}
function renderItems(e) {
	return e.map((e, t) => {
		switch (e.type) {
			case "category":
				return React.createElement(Category, Object.assign({}, e, {
					key: "category-" + t
				}));case "switch":
				return React.createElement(SwitchItem, Object.assign({}, e, {
					key: e.id
				}));default:
				return null
		}
	})
}
function Category({name:e, requires:t, items:n}) {
	const [a, s] = React.useState(!1);
	var [r, i] = Components.bulk("CategoryComponent", "FormTitle", "Caret");
	const o = SettingsManager.useState(() => !t.every(e => SettingsManager.isEnabled(e)));
	var c = React.useMemo(() => a && !o, [o, a]);
	return React.createElement("div", {
		className: Utilities.joinClassNames("bd-category", [c, "bd-category-opened"], [o, "bd-category-disabled"])
	}, React.createElement("div", {
		className: "bd-category-header",
		onClick: () => s(!a)
	}, React.createElement(r, {
		tag: r.Tags.H3
	}, e), React.createElement(i, {
		className: "bd-caret",
		direction: c ? i.Directions.DOWN : i.Directions.LEFT
	})), React.createElement("div", {
		className: "bd-category-body"
	}, c && renderItems(n)))
}
function SettingsPanel() {
	const [n] = Components.bulk("SettingsPanel", "FormTitle");
	return DiscordModules.React.createElement("div", {
		className: "bdc-settings-panel",
		children: [DiscordModules.React.createElement("div", {
			className: "bdc-title"
		}, "Settings"), Object.entries(SettingsManager.items).map(([e, {settings:t}]) => [React.createElement(n, {
			className: "bd-collection-title",
			tag: n.Tags.H2,
			key: "title-" + e
		}, React.createElement(ChannelCategory, {
			color: "var(--text-muted)"
		}), e), ...renderItems(t)])]
	})
}
function DiscordProviders({children:e}) {
	var {AccessibilityProvider:t, LayerProvider:n, container:a} = DiscordModules.DiscordProviders;
	return React.createElement(t, {
		value: {
			reducedMotion: {
				value: !1,
				rawValue: "no-preference"
			}
		}
	}, React.createElement(n, {
		value: [a]
	}, e))
}
function _extends$1() {
	return (_extends$1 = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function BDLogo(e) {
	return React.createElement("svg", _extends$1({
		width: "24",
		height: "24",
		viewBox: "0 0 2000 2000"
	}, e), React.createElement("g", null, React.createElement("path", {
		fill: "#3E82E5",
		d: "M1402.2,631.7c-9.7-353.4-286.2-496-642.6-496H68.4v714.1l442,398V490.7h257c274.5,0,274.5,344.9,0,344.9H597.6v329.5h169.8c274.5,0,274.5,344.8,0,344.8h-699v354.9h691.2c356.3,0,632.8-142.6,642.6-496c0-162.6-44.5-284.1-122.9-368.6C1357.7,915.8,1402.2,794.3,1402.2,631.7z"
	}), React.createElement("path", {
		fill: "#FFFFFF",
		d: "M1262.5,135.2L1262.5,135.2l-76.8,0c26.6,13.3,51.7,28.1,75,44.3c70.7,49.1,126.1,111.5,164.6,185.3c39.9,76.6,61.5,165.6,64.3,264.6l0,1.2v1.2c0,141.1,0,596.1,0,737.1v1.2l0,1.2c-2.7,99-24.3,188-64.3,264.6c-38.5,73.8-93.8,136.2-164.6,185.3c-22.6,15.7-46.9,30.1-72.6,43.1h72.5c346.2,1.9,671-171.2,671-567.9V716.7C1933.5,312.2,1608.7,135.2,1262.5,135.2z"
	})))
}
function _extends() {
	return (_extends = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n,
				a = arguments[t];
			for (n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n])
		}
		return e
	}).apply(this, arguments)
}
function UpdaterContextMenu() {
	var e = DiscordModules["ContextMenu"];
	return React.createElement(e.Menu, {
		navId: "UpdaterContextMenu",
		onClose: e.close
	}, React.createElement(e.Item, {
		label: "Update All",
		id: "update-all",
		action: async() => {
			var t,
				n = Object.values(UpdaterApi.getState().updates);
			for (let e = 0; e < n.length; e++) null === (t = n[e]) || void 0 === t || null !== (t = t.data) && void 0 !== t && t.update(!1)
		}
	}), React.createElement(e.Item, {
		label: "Skip Updates",
		id: "skip-updates",
		action: () => {
			UpdaterApi.setState({
				updates: {}
			}), Toasts.show("Updates Skipped!", {
				type: "success"
			})
		}
	}))
}
function UpdaterButton() {
	const t = DiscordModules["ContextMenu"],
		n = useUpdaterStore(e => Object.keys(e.updates).length);
	if (n < 1) return null;
	function a(e) {
		t.open(e, UpdaterContextMenu)
	}
	return React.createElement(DiscordProviders, null, React.createElement(DiscordModules.Tooltips.default, {
		text: `${n} update${1 < n ? "s" : ""} available!`,
		position: "left"
	}, e => React.createElement("div", _extends({}, e, {
		className: "bd-updater-button",
		onClick: () => {},
		onContextMenu: a,
		"data-updates": n
	}), React.createElement(BDLogo, {
		width: "28",
		height: "28"
	}))))
}
window.BDUpdater = {
	useUpdaterStore: useUpdaterStore
};
const warnings = new Set;
class UpdaterNode {
	async update(e) {
		await new Promise((t, n) => {
			fs1.writeFile(this.addon.path, this.code, e => {
				e ? n(e) : t()
			})
		}), UpdaterApi.setState(e => {
			const t = {
				...e.updates
			};
			return delete t[this.addon.name]
				, {
					updates: t
			}
		}), e && this.showNotice()
	}
	showNotice() {
		Toasts.show(`${this.addon.name} was updated from ${this.currentVersion} to ${this.remoteVersion}.`)
	}
	constructor(e, t, n, a, s) {
		Object.assign(this, {
			code: t,
			currentVersion: n,
			remoteVersion: a,
			addon: e,
			pending: s
		})
	}
}
class AddonUpdater {
	static getAddons(e) {
		let t = null;
		switch (e) {
			case "plugin":
				t = PluginsManager;
				break;case "theme":
				t = ThemesManager;
				break;default:
				Logger.error("AddonUpdater", "Unsupported addon type: " + e)
		}
		var a;
		if (t) return Object.fromEntries(t.addons.map(e => {
				var t,
					n;
				return [e.name, {
					version: this.parseVersion(e),
					addon: e,
					updateUrl: null !== (a = e.updateUrl) && void 0 !== a ? a : null === (e = e.instance) || void 0 === e || null === (t = e._config) || void 0 === t || null === (n = t.info) || void 0 === n ? void 0 : n.github_raw
				}]
			}))
	}
	static parseVersionString(e) {
		const t = null === (e = e.match(this.versionRegex)) || void 0 === e ? void 0 : e.toString();
		return t ? t.replace(/['"]/g, "") : null
	}
	static parseVersion(e) {
		var t,
			n,
			a,
			s;
		return "string" == typeof e ? this.parseVersionString(e) : null !== (a = e.instance) && void 0 !== a && (null !== (a = a._config) && void 0 !== a && (null !== (a = a.info) && void 0 !== a && a.version)) ? null === (a = e.instance) || void 0 === a || null === (t = a._config) || void 0 === t || null === (n = t.info) || void 0 === n ? void 0 : n.version : e.version || ("function" == typeof (null === (a = e.instance) || void 0 === a ? void 0 : a.getVersion) && null !== (s = e.instance.getVersion()) && void 0 !== s ? s : "0.0.0")
	}
	static initialize() {
		var e = DOM.createElement("div", {
			className: "bd-updater-wrapper"
		});
		DiscordModules.ReactDOM.render(React.createElement(UpdaterButton, {}), e), document.body.appendChild(e), this.patchZlibUpdater(), this.checkAllUpdates(), setInterval(() => this.checkAllUpdates(), 18e5)
	}
	static patchZlibUpdater() {
		try {
			const e = window.PluginUpdater;
			e && "function" == typeof e.checkAll && (e.checkAll = async() => {})
		} catch (e) {
			Logger.error("AddonUpdater", "Failed to patch zlibrary updater:", e)
		}
	}
	static async checkAllUpdates() {
		let t = {};
		for (const r of ["theme", "plugin"]) {
			var e = this.getAddons(r);
			for (const i in e) {
				var {addon:n, updateUrl:a} = e[i];
				if (a) try {
						var s = await this.fetchUpdate(n, a);
						s.pending && (t[i] = {
							type: r,
							data: s
						})
					} catch (e) {
						Logger.error("AddonUpdater", `Failed to fetch update for ${i}:`, e)
				} else warnings.has(i) || (Logger.warn(`AddonUpdater:${r}s`, `Could not resolve updating url for ${i}.`), warnings.add(i))
			}
		}
		0 != Object.keys(t) && UpdaterApi.setState(e => ({
			updates: Object.assign({}, e.updates, t)
		}))
	}
	static fetchUpdate(i, e) {
		return new Promise((r, t) => {
			request1(e, e => {
				const s = [];
				e.on("data", e => s.push(e)), e.on("end", () => {
					var e = s.join(""),
						t = this.parseVersionString(e),
						n = this.parseVersion(i),
						a = t && this.compareVersions(t, n);
					r(new UpdaterNode(i, e, n, t, a))
				}), e.on("error", t)
			})
		})
	}
	static compareVersions(e, t) {
		return e !== t
	}
}
AddonUpdater.versionRegex = /['"][0-9]+\.[0-9]+\.[0-9]+['"]/i;
const EXPOSE_PROCESS_GLOBAL = "bdcompat-expose-process-global",
	SettingsSections = [{
		section: "DIVIDER"
	}, {
		section: "HEADER",
		label: "BetterDiscord"
	}, {
		id: "bdcompat-settings-settings",
		section: "settings",
		label: "Settings",
		className: "bdcompat-settings-item-settings",
		element: () => DiscordModules.React.createElement(SettingsPanel, {})
	}, {
		id: "bdcompat-settings-plugins",
		section: "plugins",
		label: "Plugins",
		className: "bdcompat-settings-item-plugins",
		element: () => DiscordModules.React.createElement(AddonPanel, {
			manager: PluginsManager,
			type: "plugin"
		})
	}, {
		id: "bdcompat-settings-themes",
		section: "themes",
		label: "Themes",
		className: "bdcompat-settings-item-themes",
		element: () => DiscordModules.React.createElement(AddonPanel, {
			manager: ThemesManager,
			type: "theme"
		})
	}];
window.process || BDCompatNative.IPC.dispatch(EXPOSE_PROCESS_GLOBAL);
var index = new class {
	start() {
		Logger.log("Core", "Loading..."), Webpack.whenReady.then(this.onStart.bind(this))
	}
	onStart() {
		var e;
		this.polyfillWebpack(), setBuffer(Webpack.findByProps("Buffer")), null !== (e = null === (e = process) || void 0 === e ? void 0 : e.contextIsolated) && void 0 !== e && !e || (window.require = Require), Object.assign(window, {
			bd_require: Require,
			Buffer: Buffer$1.Buffer,
			React: DiscordModules.React
		}), this.exposeBdApi(), DataStore.initialize(), SettingsManager.initialize(), Toasts.initialize(), this.appendStyles(), ThemesManager.initialize(), PluginsManager.initialize(), this.injectSettings(), AddonUpdater.initialize()
	}
	exposeBdApi() {
		Object.freeze(BdApi), Object.freeze(BdApi.Plugins), Object.freeze(BdApi.Themes), Object.freeze(BdApi.Patcher), Object.defineProperty(window, "BdApi", {
			value: BdApi,
			configurable: !1,
			writable: !1
		})
	}
	polyfillWebpack() {
		"undefined" == typeof webpackJsonp && (window.webpackJsonp = [], Object.defineProperty(window.webpackJsonp, "__polyfill", {
			value: !0
		}), window.webpackJsonp.length = 1e4, window.webpackJsonp.flat = () => window.webpackJsonp, window.webpackJsonp.push = ([[], e, [[t]]]) => e[t]({}, {}, Webpack.request()))
	}
	appendStyles() {
		var e = BDCompatNative.executeJS("__dirname", (new Error).stack),
			e = path.resolve(e, "style.css");
		fs1.existsSync(e) && DOM.injectCSS("core", fs1.readFileSync(e, "utf8"))
	}
	async injectSettings() {
		if (!window.isUnbound)
			if ("SettingsNative" in window) {
				"undefined" == typeof KernelSettings && await new Promise(e => {
					const t = () => {
						e(), DiscordModules.Dispatcher.unsubscribe("KERNEL_SETTINGS_INIT", t)
					};
					DiscordModules.Dispatcher.subscribe("KERNEL_SETTINGS_INIT", t)
				});
				for (const e of SettingsSections) "HEADER" !== e.section && "DIVIDER" !== e.section && this._flush.push(KernelSettings.register("BetterDiscord" + e.label, {
						...e,
						render: e.element,
						icon: React.createElement(BDLogo, {
							className: "bd-logo",
							width: 16,
							height: 16
						})
					}))
			} else BdApi.alert("Missing Dependency", "BDCompat needs the kernel-settings package.")
	}
	stop() {
		for (let e = 0; e < this._flush.length; e++) this._flush[e]()
	}
	constructor() {
		this.styles = ["./ui/toast.css", "./ui/addons.css", "./ui/settings.css"], this._flush = []
	}
};
export { index as default };
