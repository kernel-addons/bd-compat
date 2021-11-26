import {ipcRenderer} from "electron";
import IPC from "./ipc";

export default function HookOnSwitch(): void {
    ipcRenderer.on("bdcompat-did-navigate", () => IPC.dispatch("navigate"));
    ipcRenderer.send("bdcompat-setup-onSwitch");
};