export default class Logger {
    static _parseType(type) {
        switch (type) {
            case "info":
            case "warn":
            case "error":
                return type;
            default:
                return "log";
        }
    }

    static _log(type, module, ...nessage) {
        type = this._parseType(type);
        console[type](`%c[Kernel:BDCompat]%c %c[${module}]%c`, "color: #A8D46B; font-weight: 700;", "", "color: #A8D46B", "", ...nessage);
    }

    static log(module, ...message) {this._log("log", module, ...message);}
    static info(module, ...message) {this._log("info", module, ...message);}
    static warn(module, ...message) {this._log("warn", module, ...message);}
    static error(module, ...message) {this._log("error", module, ...message);}
}