"use strict";

var electron = require("electron");

const NAVIGATE = "bdcompat-did-navigate";
const SETUP_ONSWITCH = "bdcompat-setup-onswitch";
const GET_APP_PATH = "bdcompat-get-app-path";

electron.ipcMain.on(SETUP_ONSWITCH, (event) => {
	const win = electron.BrowserWindow.fromWebContents(event.sender);
	win.webContents.addListener("did-navigate-in-page", () => {
		win.webContents.send(NAVIGATE);
	});
});
electron.ipcMain.on(GET_APP_PATH, (event) => {
	event.returnValue = electron.app.getAppPath();
});
