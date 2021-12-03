export default {
    shell: BDCompatNative.executeJS(`require("electron").shell`, new Error().stack),
    clipboard: BDCompatNative.executeJS(`require("electron").clipboard`, new Error().stack),
    ipcRenderer: BDCompatNative.executeJS(`Object.keys(require("electron").ipcRenderer)`, new Error().stack).slice(3).reduce((newElectron, key) => {
        newElectron[key] = BDCompatNative.executeJS(`require("electron").ipcRenderer[${JSON.stringify(key)}].bind(require("electron").ipcRenderer)`, new Error().stack);
    
        return newElectron;
    }, {})
}