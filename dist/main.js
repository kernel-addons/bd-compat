"use strict";
var electron = require("electron");
const NAVIGATE = "bdcompat-did-navigate",
	SETUP_ONSWITCH = "bdcompat-setup-onswitch",
	GET_APP_PATH = "bdcompat-get-app-path";
electron.ipcMain.on(SETUP_ONSWITCH, e => {
	const t = electron.BrowserWindow.fromWebContents(e.sender);
	t.webContents.addListener("did-navigate-in-page", () => {
		t.webContents.send(NAVIGATE)
	})
}), electron.ipcMain.on(GET_APP_PATH, e => {
	e.returnValue = electron.app.getAppPath()
});
