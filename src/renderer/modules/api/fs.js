/// <reference path="../../../../types.d.ts" />

class fs {
    static readFileSync(path, options = "utf8") {
        return BDCompatNative.executeJS(`require("fs").readFileSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`, new Error().stack);
    }

    static writeFileSync(path, data, options) {
        return BDCompatNative.executeJS(`require("fs").writeFileSync(${JSON.stringify(path)}, ${JSON.stringify(data)}, ${JSON.stringify(options)})`, new Error().stack);
    }

    static writeFile(path, data, options, callback) {
        if (typeof (options) === "function") {
            callback = options;
            options = null;
        }

        const ret = {error: null};
        try {this.writeFileSync(path, data, options);}
        catch (error) {ret.error = error}

        callback(ret.error);
    }

    static readdirSync(path, options) {
        return BDCompatNative.executeJS(`require("fs").readdirSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`, new Error().stack);
    }

    static existsSync(path) {
        return BDCompatNative.executeJS(`require("fs").existsSync(${JSON.stringify(path)});`, new Error().stack);
    }

    static mkdirSync(path, options) {
        return BDCompatNative.executeJS(`require("fs").mkdirSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`, new Error().stack);
    }

    static statSync(path, options) {
        return BDCompatNative.executeJS(`
            const stats = require("fs").statSync(${JSON.stringify(path)}, ${JSON.stringify(options)});
            const ret = {
                ...stats,
                isFile: () => stats.isFile(),
                isDirectory: () => stats.isDirectory()
            };
            ret
        `, new Error().stack);
    }

    static watch(path, options, callback) {
        if (typeof (options) === "function") {
            callback = options;
            options = null;
        }

        const eventId = "bdcompat-watcher-" + Math.random().toString(36).slice(2, 10);

        BDCompatNative.IPC.on(eventId, (event, filename) => {
            callback(event, filename);
        });

        return BDCompatNative.executeJS(`
            require("fs").watch(${JSON.stringify(path)}, ${JSON.stringify(options)}, (event, filename) => {
                BDCompatNative.IPC.dispatch(${JSON.stringify(eventId)}, event, filename);
            });
        `, new Error().stack);
    }
}

export default typeof(__BDCOMPAT_LEAKED__) === "undefined" ? fs : window.require("fs");