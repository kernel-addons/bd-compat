import DiscordModules from "../modules/discord.js"
import Logger from "../modules/logger.js";
import AddonCard, {ToolButton} from "./addoncard";
import Components from "./components.js";
import DOMWrapper from "./domwrapper.js";
import ErrorBoundary from "./errorboundary.js";
import "./addons.scss";
import {useUpdaterStore} from "../stores/updater";

export default function AddonPanel({type, manager}) {
    const {React} = DiscordModules;
    const [, forceUpdate] = React.useReducer(n => n + 1, 0);
    const [pluginSettings, setPluginSettings] = React.useState(null);
    const Button = Components.byProps("DropdownSizes");
    const Caret = Components.get("Caret");
    const FormNotice = Components.get("FormNotice");
    const pendingUpdates = useUpdaterStore(s => Object.keys(s.updates));
    const formatter = new Intl.ListFormat(document.documentElement.lang, {style: "long", type: "conjunction"});

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
                        onClick: () => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`, new Error().stack)
                    })
                ]
            }),
            pluginSettings
                ? React.createElement(ErrorBoundary(), {
                    children: pluginSettings.element
                })
                : React.createElement("div", {
                    className: "bdcompat-addon-panel-list"
                }, [
                    pendingUpdates.length ? React.createElement(FormNotice, {
                        key: "update-notice",
                        type: FormNotice.Types.BRAND,
                        className: "marginBottom20",
                        title: `Outdated ${type[0].toUpperCase() + type.slice(1)}${pendingUpdates.length > 1 ? "s" : ""}`,
                        imageData: {src: "/assets/6e97f6643e7df29b26571d96430e92f4.svg", width: 60, height: 60},
                        body: React.createElement(React.Fragment, {
                            children: [
                                `The following ${type}${pendingUpdates.length > 1 ? "s" : ""} needs to be updated:`,
                                React.createElement("br"),
                                formatter.format(pendingUpdates)
                            ]
                        })
                    }) : null,
                    manager.addons.map(addon => {
                        return React.createElement(AddonCard, {
                            addon, manager, type,
                            key: addon.name,
                            hasSettings: typeof(addon.instance?.getSettingsPanel) === "function",
                            openSettings: () => {
                                let element;
                                try {element = addon.instance.getSettingsPanel.apply(addon.instance, []);}
                                catch (error) {
                                    Logger.error("Modals", `Cannot show addon settings modal for ${addon.name}:`, error);
                                    return void Toasts.show(`Unable to open settings panel for ${addon.name}.`, {type: "error"});
                                }
    
                                if (Element.prototype.isPrototypeOf(element)) element = React.createElement(DOMWrapper, {}, element);
                                else if (typeof (element) === "function") element = React.createElement(element, {});
    
                                // Bruh
                                if (!element) {
                                    Logger.error("Modals", `Unable to find settings panel for ${addon.name}`);
                                    return void Toasts.show(`Unable to open settings panel for ${addon.name}.`, {type: "error"});
                                }
    
                                if (!element) return;
                                setPluginSettings({name: addon.name, element});
                            }
                        });
                    })
                ])
        ]
    }); 
}