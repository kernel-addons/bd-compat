import DOMWrapper from "../ui/domwrapper.js";
import ErrorBoundary from "../ui/errorboundary.js";
import DiscordModules from "./discord.js";
import Logger from "./logger.js";
import memoize from "./memoize.js";
import Webpack from "./webpack.js";

export default class Modals {
    static get ModalsAPI() {return memoize(this, "ModalsAPI", () => Webpack.findByProps("openModal", "useModalsStore"));}

    static get ConfirmationModal() {return memoize(this, "ConfirmationModal", () => Webpack.findByDisplayName("ConfirmModal"));}

    /**@returns {typeof import("react")} */
    static get Text() {return memoize(this, "Text", () => Webpack.findByDisplayName("Text"));}

    static showConfirmationModal(title, content, options = {}) {
        const {confirmText = "Okay", cancelText = "Cancel", onConfirm = () => {}, onCancel = () => {}} = options;

        return this.ModalsAPI.openModal(props => DiscordModules.React.createElement(this.ConfirmationModal, Object.assign({
            header: title,
            confirmText: confirmText,
            cancelText: cancelText,
            onConfirm,
            onCancel
        }, props), DiscordModules.React.createElement(this.Text, null, content)));
    }

    static alert(title, content) {
        return this.showConfirmationModal(title, content, {cancelText: null});
    }

    static showAddonSettings(addon) {
        let element;
        try {element = addon.instance.getSettingsPanel();}
        catch (error) {Logger.error("Modals", `Cannot show addon settings modal for ${addon.name}:`, error);}

        if (Element.prototype.isPrototypeOf(element)) element = React.createElement(DOMWrapper, {}, element);
        else if (typeof (element) === "function") element = React.createElement(element, {});

        this.showConfirmationModal(`${addon.name}-settings`, React.createElement(ErrorBoundary(), {
            children: element
        }), {cancelText: null});
    }
}