import memoize from "./memoize.js";
import Webpack from "./webpack.js";

export default class DiscordModules {
    /**@returns {typeof import("react")} */
    static get React() {return memoize(this, "React", () => Webpack.findByProps("createElement", "createContext"));}

    /**@returns {typeof import("react-dom")} */
    static get ReactDOM() {return memoize(this, "ReactDOM", () => Webpack.findByProps("findDOMNode", "render", "createPortal"));}

    static get Toasts() {
        return memoize(this, "Toasts", () => {
            return Webpack.findByProps(["createToast"], ["showToast"], {bulk: true}).reduce((api, sub) => Object.assign(api, sub), {});
        });
    }
}