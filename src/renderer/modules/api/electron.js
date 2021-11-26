export default {
    shell: BDCompatNative.executeJS(`require("electron").shell`),
    clipboard: BDCompatNative.executeJS(`require("electron").clipboard`),
    ipcRenderer: BDCompatNative.executeJS(`Object.keys(require("electron").ipcRenderer)`).slice(3).reduce((newElectron, key) => {
        newElectron[key] = BDCompatNative.executeJS(`require("electron").ipcRenderer[${JSON.stringify(key)}].bind(require("electron").ipcRenderer)`);
    
        return newElectron;
    }, {})
}