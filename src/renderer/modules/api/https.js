import EventEmitter from "./events.js";

export function get(url, options, res) {
    if (typeof options === "function") {
        res = options;
        options = {};
    }

    const id = "HTTPS_GET_" + Math.random().toString(36).slice(2);
    const emitter = new EventEmitter();

    BDCompatNative.IPC.on(id, (event, ...args) => {
        if (args[0] instanceof Uint8Array) {
            args[0].toString = () => String.fromCharCode(...args[0]);
        }

        emitter.emit(event, ...args);
    });

    BDCompatNative.executeJS(`
        require("https").get(${JSON.stringify(url)}, ${JSON.stringify(options)}, (res) => {
            for (const event of ["end", "data", "close"]) {
                res.on(event, (...args) => {
                    BDCompatNative.IPC.dispatch(${JSON.stringify(id)}, event, ...args);

                    if (event === "close") {
                        delete BDCompatEvents[${JSON.stringify(id)}];
                    }
                });

            }
        });
    `);

    return res(emitter), emitter;
}

export function request() {return Reflect.apply(get, this, arguments);}