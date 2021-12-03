export default {
    parse: (...args) => BDCompatNative.executeJS(`
        __cloneObject(require("url").parse(${args.map(e => JSON.stringify(e)).join(", ")}));
    `, new Error().stack)
}