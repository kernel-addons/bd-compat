import IPC, {events} from "./ipc";
import {ipcRenderer} from "electron";
import HookOnSwitch from "./switch";
import NodeModule from "module";
import path from "path";
import * as IPCEvents from "../common/IPCEvents";
import Process from "./process";
import {exposeGlobal} from "./util";

// Fix typings
type ActualModule = typeof NodeModule & {globalPaths: string[]};
const Module = NodeModule as ActualModule; 

// Attach onSwitch() event
HookOnSwitch();

const API = {
    getAppPath() {
        return ipcRenderer.sendSync(IPCEvents.GET_APP_PATH);
    },
    getBasePath() {
        return path.resolve(__dirname, "..");
    },
    executeJS(js: string, stack: any) {
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
    const appPath = path.resolve(API.getAppPath(), "node_modules");
    if (Module.globalPaths.indexOf(appPath) < 0) Module.globalPaths.push(appPath);
}

// Expose Native bindings and cloned process global.
exposeGlobal("BDCompatNative", API);
exposeGlobal("BDCompatEvents", events, {renderer: false});

if (!process.contextIsolated) {
    IPC.once(IPCEvents.EXPOSE_PROCESS_GLOBAL, () => {
        exposeGlobal("process", Process, {preload: false});
    });
}