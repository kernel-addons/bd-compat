const os: typeof import("os") = BDCompatNative.executeJS(`require("os")`);

export default os;