import DiscordModules from "../modules/discord.js"
import Logger from "../modules/logger.js";
import AddonCard, {ToolButton} from "./addoncard.js";
import Components from "./components.js";
import DOMWrapper from "./domwrapper.js";
import ErrorBoundary from "./errorboundary.js";

export default function AddonPanel({type, manager}) {
    const {React} = DiscordModules;
    const [, forceUpdate] = React.useReducer(n => n + 1, 0);
    const [pluginSettings, setPluginSettings] = React.useState(null);
    const Button = Components.byProps("DropdownSizes");
    const Caret = Components.get("Caret");

    React.useEffect(() => manager.on("updated", () => forceUpdate()), [type, manager, pluginSettings, forceUpdate]);

    return React.createElement("div", {
        className: "bdcompat-addon-panel type-" + type,
        children: [
            React.createElement("div", {
                className: "bdcompat-title",
                children: [
                    pluginSettings && React.createElement(Button, {
                        size: Button.Sizes.NONE,
                        look: Button.Looks.BLANK,
                        onClick: () => setPluginSettings(null)
                    }, React.createElement(Components.get("Arrow"), {direction: "LEFT"})),
                    React.createElement("span", {
                        className: "bdcompat-FlexCenter",
                        children: [
                            `${type[0].toUpperCase() + type.slice(1)}s - ${manager.addons.length}`,
                            pluginSettings && React.createElement("span", {
                                className: "bdcompat-FlexCenter",
                                children: [
                                    React.createElement(Caret, {
                                        direction: Caret.Directions.RIGHT,
                                        className: "bdcompat-settings-caret"
                                    }),
                                    pluginSettings.name
                                ]
                            })
                        ]
                    }),
                    !pluginSettings && React.createElement(ToolButton, {
                        label: "Open Folder",
                        icon: "Folder",
                        onClick: () => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`)
                    })
                ]
            }),
            pluginSettings
                ? React.createElement(ErrorBoundary(), {
                    children: pluginSettings.element
                })
                : React.createElement("div", {
                    className: "bdcompat-addon-panel-list"
                }, manager.addons.map(addon => {
                    return React.createElement(AddonCard, {
                        addon, manager, type,
                        key: addon.name,
                        hasSettings: typeof(addon.instance?.getSettingsPanel) === "function",
                        openSettings: () => {
                            let element;
                            try {element = addon.instance.getSettingsPanel();}
                            catch (error) {
                                Logger.error("Modals", `Cannot show addon settings modal for ${addon.name}:`, error);
                                return void Toasts.show(`Unable to open settings panel for ${addon.name}.`, {type: "error"});
                            }

                            if (Element.prototype.isPrototypeOf(element)) element = React.createElement(DOMWrapper, {}, element);
                            else if (typeof (element) === "function") element = React.createElement(element, {});

                            // Bruh
                            if (!element) {
                                Logger.error("Modals", `Unable to find settings panel for ${addon.name}`);
                                return void Toasts.show(`Unable to open settings panel fro ${addon.name}.`, {type: "error"});
                            }

                            if (!element) return;
                            setPluginSettings({name: addon.name, element});
                        }
                    });
                }))
        ]
    }); 
}