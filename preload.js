"use strict";

var electron = require("electron");
var Module = require("module");
var path = require("path");

function _interopDefaultLegacy(e) {
	return e && typeof e === "object" && "default" in e ? e : {
		"default": e
	};
}

var Module__default = /*#__PURE__*/ _interopDefaultLegacy(Module);
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

const GET_APP_PATH = "bdcompat-get-app-path";

// Attach onSwitch() event
HookOnSwitch();
const API = {
	getAppPath() {
		return electron.ipcRenderer.sendSync(GET_APP_PATH);
	},
	executeJS(js) {
		return eval(js);
	},
	IPC: IPC
};
// @ts-ignore - Push modules
Module__default["default"].globalPaths.push(path__default["default"].resolve(API.getAppPath(), "node_modules"));
// Expose Native bindings and cloned process global.
Object.defineProperties(window, {
	BDCompatNative: {
		value: API,
		configurable: false,
		writable: false
	},
	BDCompatEvents: {
		value: events,
		configurable: false,
		writable: false
	}
});
electron.contextBridge.exposeInMainWorld("BDCompatNative", API);
electron.contextBridge.exposeInMainWorld("process", cloneObject(process));
