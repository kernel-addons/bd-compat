import ToastsContainer from "../ui/toasts.js";
import DiscordModules from "./discord.js";
import DOM from "./dom.js";
import memoize from "./memoize.js";
import createStore from "./zustand.js";

export default class Toasts {
    static dispose() {return DiscordModules.ReactDOM.unmountComponentAtNode(this.container);}

    static get container() {
        return memoize(this, "container", () => DOM.createElement("div", {
            className: "bd-toasts"
        }));
    }

    static initialize() {
        const [useStore, Api] = createStore({toasts: []});

        document.body.appendChild(this.container);

        this.API = Api;

        DiscordModules.ReactDOM.render(DiscordModules.React.createElement(ToastsContainer, {
            useStore,
            setState: Api.setState
        }), this.container);
    }

    static show(content, options = {}) {
        // NotLikeThis
        setImmediate(() => {
            this.API.setState(state => ({...state, id: Math.random().toString(36).slice(2), toasts: state.toasts.concat({content, timeout: 3000, ...options})}));
        });
    }
}