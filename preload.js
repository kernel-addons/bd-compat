const {ipcRenderer, contextBridge} = require("electron");
const Module = require("module");
const path = require("path");

Module.globalPaths.push(path.resolve(process.cwd(), "resources", "app-original.asar", "node_modules"));

function getKeys(object) {
    const keys = [];

    for (const key in object) keys.push(key);

    return keys;
}

function cloneObject(target, newObject = {}, keys) {
    if (!Array.isArray(keys)) keys = getKeys(target);
    
    return keys.reduce((clone, key) => {
        if (typeof (target[key]) === "object" && !Array.isArray(target[key]) && target[key] !== null) clone[key] = cloneObject(target[key], {});
        else if (typeof target[key] === "function") clone[key] = target[key].bind(target);
        else clone[key] = target[key];

        return clone;
    }, newObject);
};

const events = {};
const IPC = {
    on(event, callback) {
        if (!events[event]) events[event] = new Set();

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
            try {callback(...args);}
            catch (error) {console.error(error);}
        }
    }
};

const API = {
    executeJS(js) {
        return eval(js);
    },
    IPC: IPC
};

ipcRenderer.on("bdcompat-did-navigate", () => IPC.dispatch("navigate"))
ipcRenderer.send("bdcompat-setup-onSwitch");

window.BDCompatNative = API;
window.BDCompatEvents = events;
contextBridge.exposeInMainWorld("BDCompatNative", API);
contextBridge.exposeInMainWorld("process", cloneObject(process));