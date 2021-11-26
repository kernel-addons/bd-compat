import {ipcMain, BrowserWindow, app} from "electron";
import * as IPCEvents from "../common/IPCEvents";

ipcMain.on(IPCEvents.SETUP_ONSWITCH, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);

    win.webContents.addListener("did-navigate-in-page", () => {
        win.webContents.send(IPCEvents.NAVIGATE); 
    });
});

ipcMain.on(IPCEvents.GET_APP_PATH, (event) => {
    event.returnValue = app.getAppPath();
});