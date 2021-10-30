const request = function (url, options, callback, method = "") {
    if (typeof (options) === "function") {
        callback = options;
    }

    const eventName = "request-" + Math.random().toString(36).slice(2, 10);
    BDCompatNative.IPC.once(eventName, (error, res, body) => {
        const resp = new Response(body, JSON.parse(res));
        
        Object.defineProperties(resp, {
            url: {value: url},
            type: {value: method.toLowerCase() || "default"}
        });                                                                      

        callback(error, resp, body);
    });

    return BDCompatNative.executeJS(`
        const request = require("request");

        ("${method}" ? request["${method}"] : request)("${url}", ${JSON.stringify(options)}, (error, res, body) => {
            BDCompatNative.IPC.dispatch("${eventName}", error, JSON.stringify(res), body);   
            delete BDCompatEvents["${eventName}"]; // No memory leak    
        });
    `);
};

Object.assign(request, Object.fromEntries(["get", "put", "post", "delete"].map(method => [
    method,
    function (url, options, callback) {
        return request(url, options, callback, method);
    }
])));
export default request;