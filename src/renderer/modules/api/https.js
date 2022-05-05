import EventEmitter from "./events.js";

class Request extends EventEmitter {
    _req = null;

    constructor(req) {
        super();
        
        this._req = req;
    }

    end() {
        this._req.end();
    }

    _setData(data) {
        Object.assign(this, data);
    }
}

const makeRequest = BDCompatNative.executeJS((
(url, options = {}, callback) => {
    const socket = require("https").get(url, options, (res) => {
        for (const event of ["data", "end", "close"]) {
            res.on(event, (...args) => {
                if (event === "end") {
                    const items = ["statusCode", "statusMessage", "url", "headers", "method", "aborted", "complete", "rawHeaders", "end"];

                    callback("end", Object.fromEntries(
                        items.map(item => [item, res[item]])
                    ));
                } else {
                    callback(event, args);
                }
            });
        }
    });
    
    return {
        end() {socket.end();}
    };
}).toString(), new Error().stack);

export function get(url, options, res) {
    if (typeof options === "function") {
        res = options;
        options = {};
    }

    const socket = makeRequest(url, options, (event, data) => {
        if (event === "end") {
            request._setData(data);
            data = undefined;
        }

        if (event === "data" && data[0] instanceof Uint8Array) {
            data[0].toString = () => String.fromCharCode(...data[0]);
        }

        request.emit(event, ...data);
    });

    const request = new Request(socket);

    return res(request), request;
}

export function request() {return Reflect.apply(get, this, arguments);}

const deserialize = function ({props, name}) {
    const object = {
        [Symbol.toStringTag]: name
    };

    for (let i = 0; i < props.length; i++) {
        const [key, value, nativeToString] = props[i];

        object[key] = value;
        if (typeof value !== "function" || Object.isFrozen(value)) continue;
        
        Object.defineProperty(object[key], "toString", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: () => nativeToString,
        });
    }

    return object;
};

const __createServer__native = ((options) => {
    // Javascript's Object.keys doesn't have a way to get non enumerable properties, so this works.
    const getAllProperties = function (object) {
        const keys = [];
        for (const key in object) {
            // Hide internals to reduce redundancy
            if (key.charAt(0) === "_") continue;

            keys.push(key);
        }
        return keys;
    };

    const serialize = function (object) {
        return {
            props: getAllProperties(object).map(prop => {
                let value = typeof (object[prop]) === "function" ? object[prop].bind(object) : object[prop];

                if (prop === "end") {
                    const original = value;
                    value = (chunk) => {
                        if (chunk && chunk instanceof Uint8Array) chunk = Buffer.from(chunk);
                        return original.call(object, chunk);
                    };
                }

                return [prop, value, object[prop]?.toString?.() ?? ""];
            }),
            name: object[Symbol.toStringTag] ?? object.constructor.name
        };
    };
    
    let handler = () => {};
    const {Server} = require("http");
    const server = new Server(options, (req, res) => {
        handler(
            serialize(req),
            serialize(res)
        );
    });
    
    return {
        props: serialize(server),
        tag: server.constructor.name,
        nativeHandle(callback) {handler = callback;}
    };
}).toString();

export function createServer(options, listener) {
    if (typeof options === "function") {
        listener = options;
        options = {};
    }

    const server = BDCompatNative.executeJS(
        `(${__createServer__native})` + `(${JSON.stringify(options)})`,
        new Error().stack
    );

    server.nativeHandle((req, res) => {
        listener(
            deserialize(req),
            deserialize(res)
        );
    });
    
    return deserialize(server.props);
};