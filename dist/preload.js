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

const GET_APP_PATH = "bdcompat-get-app-path";

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
function hasLeak() {
	var ref;
	return (electron.webFrame === null || electron.webFrame === void 0 ? void 0 : (ref = electron.webFrame.top) === null || ref === void 0 ? void 0 : ref.context) != null;
}
function exposeGlobal(key, namespace, everywhere = true) {
	if (hasLeak()) {
		electron.webFrame.top.context.window[key] = namespace;
	} else {
		electron.contextBridge.exposeInMainWorld(key, namespace);
	}
	if (everywhere)
		window[key] = namespace;
}
Object.assign(window, {
	__cloneObject: cloneObject,
	__getKeys: getKeys
});

const Process = cloneObject(process);
Process.env.injDir = __dirname;

// Attach onSwitch() event
HookOnSwitch();
const API = {
	getAppPath() {
		return electron.ipcRenderer.sendSync(GET_APP_PATH);
	},
	executeJS(js) {
		return eval(js);
	},
	hasLeak() {
		return hasLeak();
	},
	IPC: IPC
};
// @ts-ignore - Push modules
Module__default["default"].globalPaths.push(path__default["default"].resolve(API.getAppPath(), "node_modules"));
// Expose Native bindings and cloned process global.
exposeGlobal("BDCompatNative", API);
exposeGlobal("BDCompatEvents", events, false);
if (!process.contextIsolated) exposeGlobal("process", Process, false);
if (hasLeak()) {
	exposeGlobal("require", require);
	exposeGlobal("Buffer", Buffer);
	exposeGlobal("__BDCOMPAT_LEAKED__", true);
}
