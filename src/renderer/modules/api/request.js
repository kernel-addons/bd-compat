import BufferModule from "./buffer";

export class RequestResponse extends Response {
    constructor({res, body, url, type}) {
        super(body, {
            statusText: res.statusMessage,
            status: res.status
        });
        this._res = res;
        this._url = url;
        this._type = type;
    }
    get headers() {return this._res.headers;}
    get url() {return this._url;}
    get type() {return this._type;}
    get statusCode() {return this._res.statusCode;}
    get status() {return this.statusCode;}
    get ok() {return this.status >= 200 && this.status <= 299;}
}

try {
    BDCompatNative.executeJS(`
        window.__REQUEST_RES_RET__ = [
            "request", 
            "headers", 
            "body", 
            "statusCode",
            "rawHeaders",
            "statusMessage",
            "url",
            "complete"
        ];
    `);
} catch (error) {
    console.error("[BDCompat] Fatal Error: Could not define request properties:", error);
}

const request = function (url, options, callback, method = "") {
    if (typeof (options) === "function") {
        callback = options;
    }

    const eventName = "request-" + Math.random().toString(36).slice(2, 10);
    BDCompatNative.IPC.once(eventName, (error, res, body) => {
        if (body instanceof Uint8Array) body = BufferModule.Buffer.from(body);

        res = JSON.parse(res);
        const resp = new RequestResponse({
            body, res, url,
            type: method.toLowerCase() || "default"
        });   

        callback(error, resp, body);
    });

    return BDCompatNative.executeJS(`
        const request = require("request");
        const method = "${method}";

        (method ? request[method] : request)(${JSON.stringify(url)}, ${JSON.stringify(options)}, (error, res, body) => {
            const ret = Object.fromEntries(__REQUEST_RES_RET__.map(e => [e, res?.[e]]));
            
            BDCompatNative.IPC.dispatch("${eventName}", error, JSON.stringify(ret), body);   
        });
    `, new Error().stack);
};

Object.assign(request,
    Object.fromEntries(["get", "put", "post", "delete", "head", "del"].map(method => [
        method,
        function (url, options, callback) {
            return request(url, options, callback, method);
        }
    ]))
);
export default request;