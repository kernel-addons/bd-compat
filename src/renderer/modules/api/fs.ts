/// <reference path="../../../../types.d.ts" />

const methods = [
    ["appendFile"],
    ["appendFileSync"],
    ["access"],
    ["accessSync"],
    ["chown"],
    ["chownSync"],
    ["chmod"],
    ["chmodSync"],
    ["close"],
    ["closeSync"],
    ["copyFile"],
    ["copyFileSync"],
    // ["createReadStream"],
    // ["createWriteStream"],
    ["exists"],
    ["existsSync"],
    ["fchown"],
    ["fchownSync"],
    ["fchmod"],
    ["fchmodSync"],
    ["fdatasync"],
    ["fdatasyncSync"],
    ["fstat"],
    ["fstatSync"],
    ["fsync"],
    ["fsyncSync"],
    ["ftruncate"],
    ["ftruncateSync"],
    ["futimes"],
    ["futimesSync"],
    ["lchown"],
    ["lchownSync"],
    // ["lchmod"],
    // ["lchmodSync"],
    ["link"],
    ["linkSync"],
    ["lstat", ret => {return {...ret, isDirectory() {return ret.isDirectory();}, isFile() {return ret.isFile();}}}],
    ["lstatSync", ret => {return {...ret, isDirectory() {return ret.isDirectory();}, isFile() {return ret.isFile();}}}],
    ["lutimes"],
    ["lutimesSync"],
    ["mkdir"],
    ["mkdirSync"],
    ["mkdtemp"],
    ["mkdtempSync"],
    ["open"],
    ["openSync"],
    ["opendir"],
    ["opendirSync"],
    ["readdir"],
    ["readdirSync"],
    ["read"],
    ["readSync"],
    ["readv"],
    ["readvSync"],
    ["readFile"],
    ["readFileSync"],
    ["readlink"],
    ["readlinkSync"],
    ["realpath"],
    ["realpathSync"],
    ["rename"],
    ["renameSync"],
    ["rm"],
    ["rmSync"],
    ["rmdir"],
    ["rmdirSync"],
    ["stat", ret => {return {...ret, isDirectory() {return ret.isDirectory();}, isFile() {return ret.isFile();}}}],
    ["statSync", ret => {return {...ret, isDirectory() {return ret.isDirectory();}, isFile() {return ret.isFile();}}}],
    ["symlink"],
    ["symlinkSync"],
    ["truncate"],
    ["truncateSync"],
    ["unwatchFile"],
    ["unlink"],
    ["unlinkSync"],
    ["utimes"],
    ["utimesSync"],
    ["watch", ret => {return {...ret, close: () => ret.close()}}],
    ["watchFile", ret => {return {...ret, close: () => ret.close()}}],
    ["writeFile"],
    ["writeFileSync"],
    ["write"],
    ["writeSync"],
    ["writev"],
    ["writevSync"],
    ["writev"],
    ["writevSync"],
    // ["Dir"],
    // ["Dirent"],
    // ["Stats"],
    // ["ReadStream"],
    // ["WriteStream"],
    // ["FileReadStream"],
    // ["FileWriteStream"],
    // ["_toUnixTimestamp"],
    ["F_OK"],
    ["R_OK"],
    ["W_OK"],
    ["X_OK"],
    ["constants"],
    ["promises", ret => {return ret.isFile ? {...ret, isDirectory() {return ret.isDirectory();}, isFile() {return ret.isFile();}} : ret}]
];

const fs: typeof import("node:fs") = ((fs) => {
    const passthrough = _ => _;
    for (let i = 0; i < methods.length; i++) {
        const [method, factory = passthrough] = methods[i];
        const nativeMethod = BDCompatNative.executeJS(`
            const factory = ${factory.toString()};
            const method = require("fs")["${method}"];
            const override = (() => {
                if (typeof method === "function") return (...args) => factory(method(...args));
                if (typeof method === "object") {
                    const clone = {};
                    const keys = Object.keys(method);

                    for (let i = 0; i < keys.length; i++) {
                        clone[keys[i]] = typeof method[keys[i]] === "function" ? (...args) => {
                            const ret = method[keys[i]](...args);
                            if (ret instanceof Promise) return ret.then(ret => factory(ret));

                            return ret;
                        } : method[keys[i]];
                    }

                    return clone;
                }

                return method;
            })();
            override;
        `, new Error().stack);
        
        // @ts-ignore
        fs[method] = nativeMethod;
    }

    return fs as typeof import("node:fs");
})({});

// class fs {
//     static readFileSync(path, options = "utf8") {
//         return BDCompatNative.executeJS(`require("fs").readFileSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`, new Error().stack);
//     }

//     static writeFileSync(path, data, options) {
//         return BDCompatNative.executeJS(`require("fs").writeFileSync(${JSON.stringify(path)}, ${JSON.stringify(data)}, ${JSON.stringify(options)})`, new Error().stack);
//     }

//     static writeFile(path, data, options, callback) {
//         const args = [
//             JSON.stringify(path),
//             JSON.stringify(data),
//             typeof options !== "function" && JSON.stringify(options),
//         ].filter(Boolean);
//         const id = "WRITE_FILE_" + Math.random().toString().slice(2);

//         BDCompatNative.IPC.once(id, (error) => {
//             callback(error);
//         });

//         BDCompatNative.executeJS(`
//             require("fs").writeFile(${args.join(", ")}, (error) => {
//                 BDCompatNative.IPC.dispatch(${JSON.stringify(id)}, error);
//             });
//         `.replace(/\s{4}/g, "  "), new Error().stack);
//     }

//     static readdirSync(path, options) {
//         return BDCompatNative.executeJS(`require("fs").readdirSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`, new Error().stack);
//     }

//     static existsSync(path) {
//         return BDCompatNative.executeJS(`require("fs").existsSync(${JSON.stringify(path)});`, new Error().stack);
//     }

//     static mkdirSync(path, options) {
//         return BDCompatNative.executeJS(`require("fs").mkdirSync(${JSON.stringify(path)}, ${JSON.stringify(options)});`, new Error().stack);
//     }

//     static statSync(path, options) {
//         return BDCompatNative.executeJS(`
//             const stats = require("fs").statSync(${JSON.stringify(path)}, ${JSON.stringify(options)});
//             const ret = {
//                 ...stats,
//                 isFile: () => stats.isFile(),
//                 isDirectory: () => stats.isDirectory()
//             };
//             ret
//         `, new Error().stack);
//     }

//     static watch(path, options, callback) {
//         if (typeof (options) === "function") {
//             callback = options;
//             options = null;
//         }

//         const eventId = "bdcompat-watcher-" + Math.random().toString(36).slice(2, 10);

//         BDCompatNative.IPC.on(eventId, (event, filename) => {
//             callback(event, filename);
//         });

//         return BDCompatNative.executeJS(`
//             require("fs").watch(${JSON.stringify(path)}, ${JSON.stringify(options)}, (event, filename) => {
//                 BDCompatNative.IPC.dispatch(${JSON.stringify(eventId)}, event, filename);
//             });
//         `, new Error().stack);
//     }
// }

export default fs;