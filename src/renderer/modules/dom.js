import memoize from "./memoize.js";

export default class DOM {
    static get head() {return memoize(this, "head", () => document.head.appendChild(this.createElement("bd-head")));}

    static createElement(type, options, ...children) {
        const node = Object.assign(document.createElement(type), options);

        node.append(...children);

        return node;
    }

    static injectCSS(id, css) {
        const element = this.createElement("style", {
            id,
            textContent: css
        });

        this.head.appendChild(element);

        return element;
    }

    static clearCSS(id) {
        const element = this.head.querySelector(`style[id="${id}"]`);

        if (element) element.remove();
    }
}