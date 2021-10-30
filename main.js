const {ipcMain, BrowserWindow} = require("electron");

ipcMain.on("bdcompat-setup-onSwitch", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);

    win.webContents.addListener("did-navigate-in-page", () => {
        win.webContents.send("bdcompat-did-navigate"); 
    });
});