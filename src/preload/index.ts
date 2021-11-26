import IPC, {events} from "./ipc";
import {ipcRenderer} from "electron";
import HookOnSwitch from "./switch";
import Module from "module";
import path from "path";
import * as IPCEvents from "../common/IPCEvents";
import Process from "./process";
import {exposeGlobal, hasLeak} from "./util";

// Attach onSwitch() event
HookOnSwitch();

const API = {
    getAppPath() {
        return ipcRenderer.sendSync(IPCEvents.GET_APP_PATH);
    },
    executeJS(js: string) {
        return eval(js);
    },
    hasLeak() {
        return hasLeak();
    },
    IPC: IPC
};

// @ts-ignore - Push modules
Module.globalPaths.push(path.resolve(API.getAppPath(), "node_modules"));

// Expose Native bindings and cloned process global.
exposeGlobal("BDCompatNative", API);
exposeGlobal("BDCompatEvents", events, false);

if (!process.contextIsolated) exposeGlobal("process", Process, false);
if (hasLeak()) {
    exposeGlobal("require", require);
    exposeGlobal("Buffer", Buffer);
    exposeGlobal("__BDCOMPAT_LEAKED__", true);
}