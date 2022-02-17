export default BDCompatNative.executeJS(`(() => {
try {
    return require("mime-types");
} catch {
    return {};
}
})()`, new Error().stack);