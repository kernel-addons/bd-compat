if (typeof (Array.prototype.at) !== "function") {
    Array.prototype.at = function (index) {
        return index < 0 ? this[this.length - Math.abs(index)] : this[index];
    };
}

export const Events = {
    CREATE: "CREATE",
    LENGTH_CHANGE: "LENGTH_CHANGE",
    PUSH: "PUSH",
    LOADED: "LOADED"
};

const Webpack = window.Webpack ?? (window.Webpack = new class Webpack {
    get #id() {return "kernel-req" + Math.random().toString().slice(2, 5)};

    #_cache = null;

    #events = Object.fromEntries(Object.keys(Events).map(key => [key, new Set()]));

    constructor() {
        Object.defineProperty(window, "webpackChunkdiscord_app", {
            get() {return void 0;},
            set: (value) => {
                this.dispatch(Events.CREATE);

                const originalPush = value.push;
                value.push = (...values) => {
                    this.dispatch(Events.LENGTH_CHANGE, value.length + values.length);
                    this.dispatch(Events.PUSH, values);

                    return Reflect.apply(originalPush, value, values);
                };
                
                Object.defineProperty(window, "webpackChunkdiscord_app", {
                    value,
                    configurable: true,
                    writable: true
                });
                return value;
            },
            configurable: true
        });

        const unlisten = this.on(Events.PUSH, ([[, chunk]]) => {
            const values = Object.values(chunk);
        
            if (values.length === 1 && values.some(e => e.toString().indexOf("new Worker") > -1)) {
                this.dispatch(Events.LOADED);
                unlisten();
            }
        });
    }


    dispatch(event, ...args) {
        if (!(event in this.#events)) throw new Error(`Unknown Event: ${event}`);

        this.#events[event].forEach(callback => {
            try {callback(...args);}
            catch (err) {console.error(err);}
        });
    }

    on(event, callback) {
        if (!(event in this.#events)) throw new Error(`Unknown Event: ${event}`);

        return this.#events[event].add(callback), () => this.off(event, callback);
    }

    off(event, callback) {
        if (!(event in this.#events)) throw new Error(`Unknown Event: ${event}`);

        return this.#events[event].delete(callback);
    }

    once(event, callback) {
        const unlisten = this.on(event, (...args) => {
            unlisten();
            callback(...args);
        });
    }

    get webpackLength() {return this.webpackNamespace ? this.webpackNamespace.flat(10).length : 0;}

    get webpackNamespace() {return window.webpackJsonp || window.webpackChunkdiscord_app;}

    async wait(callback) {
        return new Promise(resolve => {
            this.once(Events.LOADED, () => {
                resolve();
                typeof (callback) === "function" && callback();
            });
        });
    }

    request(cache) {
        if (cache && this.#_cache) return this.#_cache;
        let req = void 0;

        if ("webpackJsonp" in window && !webpackJsonp.__polyfill) {
            req = window.webpackJsonp.push([[], {
                [this.#id]: (module, exports, req) => module.exports = req
            }, [[this.#id]]]);
        } else if ("webpackChunkdiscord_app" in window) {
            window.webpackChunkdiscord_app.push([[this.#id], {}, __webpack_require__ => req = __webpack_require__]);
        }

        this.#_cache = req;
        return req;
    }

    findModule(filter, all = false, cache = true) {
        const __webpack_require__ = this.request(cache);
        const found = [];

        const wrapFilter = (module) => {
            try {return filter(module);}
            catch {return false;}
        };

        for (let i in __webpack_require__.c) {
            var m = __webpack_require__.c[i].exports;
            if ((typeof m == "object" || typeof m == "function") && wrapFilter(m)) found.push(m);
            if (m?.__esModule) for (let j in m) if ((typeof m[j] == "object" || typeof m[j] == "function") && wrapFilter(m[j])) found.push(m[j]);
        }
        return all ? found : found.at(0);
    }

    findModules(filter) {return this.findModule(filter, true);}

    bulk(...filters) {
        const found = new Array(filters.length);
        
        this.findModule(module => {
            const matches = filters.filter(filter => {
                try {return filter(module);}
                catch {return false;}
            });

            if (!matches.length) return false;

            for (const filter of matches) {
                found[filters.indexOf(filter)] = module;
            }

            return false;
        });

        return found;
    }

    findByProps(...props) {
        const bulk = typeof (props.at(-1)) === "boolean" && props.at(-1);
        const filter = (props, module) => module && props.every(prop => prop in module);
        
        return bulk
            ? this.bulk(...props.slice(0, -1).map(props => filter.bind(null, props)))
            : this.findModule(filter.bind(null, props));
    }

    findByDisplayName(...displayName) {
        const bulk = typeof (displayName.at(-1)) === "boolean" && displayName.at(-1);
        const defaultExport = typeof (displayName.at(-2)) === "boolean" && displayName.at(-2);
        if (bulk) displayName.splice(-1, 1);
        if (defaultExport) displayName.splice(-1, 1);

        const filter = (name, module) => defaultExport
            ? module?.default?.displayName === name
            : module?.displayName === name;
        
        return bulk
            ? this.bulk(...displayName.map(name => filter.bind(null, name)))
            : this.findModule(filter.bind(null, displayName[0]));
    }
});

export default Webpack;