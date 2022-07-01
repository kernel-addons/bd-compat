import DiscordModules from "./discord.js";
import memoize from "./memoize.js";
import Webpack from "./webpack";

export default class Modals {
    static get ModalsAPI() {return memoize(this, "ModalsAPI", () => Webpack.findByProps("openModal", "useModalsStore"));}

    static get ModalComponents() {return memoize(this, "ModalComponents", () => Webpack.findByProps("ModalRoot", "ModalHeader"));}

    static get Forms() {return memoize(this, "Forms", () => Webpack.findByProps("FormTitle", "FormItem"));}

    static get Button() {return memoize(this, "Button", () => Webpack.findByProps("BorderColors"));}

    static get ConfirmationModal() {return memoize(this, "ConfirmationModal", () => Webpack.findByDisplayName("ConfirmModal"));}

    static get Text() {return memoize(this, "Text", () => Webpack.findByDisplayName("LegacyText"));}

    static showConfirmationModal(title, content, options = {}) {
        const {confirmText = "Okay", cancelText = "Cancel", onConfirm = () => {}, onCancel = () => {}, danger = false} = options;

        return this.ModalsAPI.openModal(props => DiscordModules.React.createElement(this.ConfirmationModal, Object.assign({
            header: title,
            confirmText: confirmText,
            cancelText: cancelText,
            onConfirm,
            onCancel,
            confirmButtonColor: danger ? this.Button.Colors.RED : this.Button.Colors.BRAND
        }, props), DiscordModules.React.createElement(this.Text, null, content)));
    }

    static alert(title, content) {
        return this.showConfirmationModal(title, content, {cancelText: null});
    }
}
