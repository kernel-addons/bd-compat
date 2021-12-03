import EventEmitter from "./events.js";

export function get(url, options, res) {
    if (typeof options === "function") {
        res = options;
        options = {};
    }

    const id = "HTTPS_GET_" + Math.random().toString(36).slice(2);
    const emitter = new EventEmitter();

    BDCompatNative.IPC.on(id, (event, ...args) => {
        if (event === "__data") {
            return Object.assign(emitter, ...args);
        }

        if (args[0] instanceof Uint8Array) {
            args[0].toString = () => String.fromCharCode(...args[0]);
        }

        if (event === "end") {
            Object.assign(emitter, args[0]);
        }

        emitter.emit(event, ...args);
    });

    Object.assign(emitter, {
        end: () => void 0
    });

    BDCompatNative.executeJS(`
        require("https").get(${JSON.stringify(url)}, ${JSON.stringify(options)}, (res) => {
            for (const event of ["end", "data", "close"]) {
                res.on(event, (...args) => {
                    if (event === "end") {
                        args.push(Object.fromEntries(["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders", "end"].map(e => [e, res[e]])));
                    }

                    BDCompatNative.IPC.dispatch(${JSON.stringify(id)}, event, ...args);

                    if (event === "close") {
                        delete BDCompatEvents[${JSON.stringify(id)}];
                    }
                });
            }
        });
    `, new Error().stack);

    return res(emitter), emitter;
}

export function request() {return Reflect.apply(get, this, arguments);}

export function createServer() {
    return DiscordNative.nativeModules.requireModule("discord_rpc").RPCWebSocket.http.createServer.apply(this, arguments);
}