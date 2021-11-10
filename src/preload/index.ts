import IPC, {events} from "./ipc";
import {contextBridge, ipcRenderer} from "electron";
import HookOnSwitch from "./switch";
import Module from "module";
import path from "path";
import * as IPCEvents from "../common/IPCEvents";
import Process from "./process";


// Attach onSwitch() event
HookOnSwitch();

const API = {
    getAppPath() {
        return ipcRenderer.sendSync(IPCEvents.GET_APP_PATH);
    },
    executeJS(js: string) {
        return eval(js);
    },
    IPC: IPC
};

// @ts-ignore - Push modules
Module.globalPaths.push(path.resolve(API.getAppPath(), "node_modules"));

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
contextBridge.exposeInMainWorld("BDCompatNative", API);
contextBridge.exposeInMainWorld("process", Process);