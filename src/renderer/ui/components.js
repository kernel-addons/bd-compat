import Webpack from "../modules/webpack.js";

export default class Components {
    static #cache = {};

    static byProps(...props) {
        const name = props.join(":");
        if (this.#cache[name]) return this.#cache[name];

        this.#cache[name] = Webpack.findModule(m => props.every(p => p in m) && typeof(m) === "function");

        return this.#cache[name];
    }

    static get(name, filter = _ => _) {
        if (this.#cache[name]) return this.#cache[name];

        this.#cache[name] = Webpack.findModule(m => m.displayName === name && filter(m));

        return this.#cache[name];
    }

    static bulk(id, ...filters) {
        if (this.#cache[id]) return this.#cache[id];

        this.#cache[id] = Webpack.bulk(...filters.map(filter => {
            if (typeof filter === "string") return m => m.displayName === filter && typeof (m) === "function";
            if (Array.isArray(filter)) return m => filter.every(p => p in m);

            return filter;
        }));

        return this.#cache[id];
    }
}