"use strict";

var electron = require("electron");
var NodeModule = require("module");
var path = require("path");

function _interopDefaultLegacy(e) {
	return e && typeof e === "object" && "default" in e ? e : {
		"default": e
	};
}

var NodeModule__default = /*#__PURE__*/ _interopDefaultLegacy(NodeModule);
var path__default = /*#__PURE__*/ _interopDefaultLegacy(path);

const events = {
};
const IPC = {
	on(event, callback) {
		if (!events[event])
			events[event] = new Set();
		return events[event].add(callback), IPC.off.bind(null, event, callback);
	},
	off(event, callback) {
		if (!events[event]) return;
		events[event].delete(callback);
		if (!events[event].size)
			delete events[event];
	},
	once(event, callback) {
		const unsubscribe = IPC.on(event, (...args) => {
			unsubscribe();
			return callback(...args);
		});
	},
	dispatch(event, ...args) {
		if (!events[event]) return;
		for (const callback of events[event]) {
			try {
				callback(...args);
			} catch (error) {
				console.error(error);
			}
		}
	}
};

function HookOnSwitch() {
	electron.ipcRenderer.on("bdcompat-did-navigate", () => IPC.dispatch("navigate")
	);
	electron.ipcRenderer.send("bdcompat-setup-onSwitch");
}

const GET_APP_PATH = "bdcompat-get-app-path";
const EXPOSE_PROCESS_GLOBAL = "bdcompat-expose-process-global";

// @ts-nocheck
function getKeys(object) {
	const keys = [];
	for (const key in object) keys.push(key);
	return keys;
}
function cloneObject(target, newObject = {
	}, keys) {
	if (!Array.isArray(keys))
		keys = getKeys(target);
	return keys.reduce((clone, key) => {
		if (typeof target[key] === "object" && !Array.isArray(target[key]) && target[key] !== null)
			clone[key] = cloneObject(target[key], {
			});
		else if (typeof target[key] === "function")
			clone[key] = target[key].bind(target);
		else
			clone[key] = target[key];
		return clone;
	}, newObject);
}
function exposeGlobal(key, namespace, {preload =true, renderer =true} = {
	}) {
	if (renderer) electron.contextBridge.exposeInMainWorld(key, namespace);
	if (preload)
		window[key] = namespace;
}
Object.assign(window, {
	__cloneObject: cloneObject,
	__getKeys: getKeys
});

const Process = cloneObject(process);
Process.env.injDir = __dirname;

const Module = NodeModule__default["default"];
// Attach onSwitch() event
HookOnSwitch();
const API = {
	getAppPath() {
		return electron.ipcRenderer.sendSync(GET_APP_PATH);
	},
	getBasePath() {
		return path__default["default"].resolve(__dirname, "..");
	},
	executeJS(js, stack) {
		return eval(`
            try {
                ${js}
            } catch (error) {
                console.groupCollapsed("%c[BDCompatNative::executeJS] Fatal Error:%c", "color: red; background: #290000", "background: #290000", error.message);
                console.error("Caller stack:", Object.assign(new Error(error.message), {stack: stack}));
                console.error("Preload stack:", error);
                console.groupEnd();
                throw error;
            }
        `);
	},
	IPC: IPC
};
// @ts-ignore - Push modules
{
	const appPath = path__default["default"].resolve(API.getAppPath(), "node_modules");
	if (Module.globalPaths.indexOf(appPath) < 0) Module.globalPaths.push(appPath);
} // Expose Native bindings and cloned process global.
exposeGlobal("BDCompatNative", API);
exposeGlobal("BDCompatEvents", events, {
	renderer: false
});
if (!process.contextIsolated) {
	IPC.once(EXPOSE_PROCESS_GLOBAL, () => {
		exposeGlobal("process", Process, {
			preload: false
		});
	});
}
