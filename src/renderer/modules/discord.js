import memoize from "./memoize.js";
import Webpack from "./webpack";

export default class DiscordModules {
    /**@returns {typeof import("react")} */
    static get React() {return memoize(this, "React", () => Webpack.findByProps("createElement", "createContext"));}

    /**@returns {typeof import("react-dom")} */
    static get ReactDOM() {return memoize(this, "ReactDOM", () => Webpack.findByProps("findDOMNode", "render", "createPortal"));}

    static get Tooltips() {return memoize(this, "Tooltips", () => Webpack.findByProps("TooltipContainer"));}

    static get DiscordProviders() {
        return memoize(this, "DiscordProviders", () => {
            const [
                {AccessibilityPreferencesContext: {Provider: AccessibilityProvider}} = {
                    AccessibilityPreferencesContext: {}
                },
                Layers,
                {LayerClassName} = {}
            ] = Webpack.findByProps(
                ["AccessibilityPreferencesContext"],
                ["AppReferencePositionLayer"],
                ["LayerClassName"],
                {bulk: true}
            );

            return {
                AccessibilityProvider,
                LayerProvider: Layers.AppLayerProvider().props.layerContext.Provider,
                get container() {return document.querySelector(`#app-mount .${LayerClassName}`);}
            };
        });
    }

    static get Toasts() {
        return memoize(this, "Toasts", () => {
            return Object.assign({}, ...Webpack.findByProps(["createToast"], ["showToast"], {bulk: true}));
        });
    }

    static get PrivateChannelActions() {return memoize(this, "PrivateChannelActions", () => Webpack.findByProps("openPrivateChannel"));}

    static get Dispatcher() {return memoize(this, "Dispatcher", () => Webpack.findByProps("_dispatch", "dispatch"));}

    static get LayerActions() {return memoize(this, "LayerActions", () => Webpack.findByProps("popLayer"));}

    static get InviteActions() {return memoize(this, "InviteActions", () => Webpack.findByProps("resolveInvite"));}

    static get ContextMenu() {
        return memoize(this, "ContextMenu", () => {
            const [ContextMenuActions, ContextMenuComponents] = Webpack.findByProps(["openContextMenu"], ["MenuItem", "default"], {bulk: true});

            const output = {
                open: ContextMenuActions.openContextMenu,
                close: ContextMenuActions.closeContextMenu,
                Menu: ContextMenuComponents.default
            };

            for (let key in ContextMenuComponents) {
                if (!key.startsWith("Menu")) continue;

                output[key.slice("Menu".length)] = ContextMenuComponents[key];
            }

            return output;
        });
    }
}
