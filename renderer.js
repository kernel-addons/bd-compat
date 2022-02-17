let started = false;
const exports = {
    start() {started = true;}, 
    stop() {started = false;}
};
if (!window.location.href.includes("ptb")) {
    import("./dist/renderer.js").then(({default: plugin}) => {
        if (started) plugin.start();

        Object.assign(exports, plugin);
    });
}

export default exports;