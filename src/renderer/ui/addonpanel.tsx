import DiscordModules from "../modules/discord.js"
import Logger from "../modules/logger.js";
import AddonCard, {ToolButton} from "./addoncard";
import Components from "./components.js";
import DOMWrapper from "./domwrapper.js";
import ErrorBoundary from "./errorboundary.js";
import "./addons.scss";
import {useUpdaterStore} from "../stores/updater";
import Toasts from "../modules/toasts.js";

let Boundary: typeof React.Component = null;

export default function AddonPanel({type, manager}) {
    const {React} = DiscordModules;
    Boundary ??= ErrorBoundary();
    const [, forceUpdate] = React.useReducer(n => n + 1, 0);
    const [pluginSettings, setPluginSettings] = React.useState(null);
    const Button = Components.byProps("DropdownSizes");
    const Caret = Components.get("Caret");
    const FormNotice = Components.get("FormNotice");
    const Arrow = Components.get("Arrow");
    const pendingUpdates = useUpdaterStore(s => {
        const result = [];
        for (const addonId in s.updates) {
            if (s.updates[addonId].type !== type) continue;
            result.push(addonId);
        }
        return result;
    });
    const formatter = new (Intl as any).ListFormat(document.documentElement.lang, {style: "long", type: "conjunction"});

    React.useEffect(() => manager.on("updated", () => forceUpdate()), [type, manager, pluginSettings, forceUpdate]);

    return (
        <div className={`bdc-addon-panel ${type}`}> 
            <div className="bdc-title">
                {pluginSettings && (
                    <Button
                        size={Button.Sizes.NONE}
                        look={Button.Looks.BLANK}
                        onClick={() => setPluginSettings(null)}
                    >
                        <Arrow direction="LEFT" />
                    </Button>
                )}
                <span className="bdc-FlexCenter">
                    {type[0].toUpperCase() + type.slice(1)}s - {manager.addons.length}
                    {pluginSettings && (
                        <span className="bdc-FlexCenter">
                            <Caret direction={Caret.Directions.RIGHT} className="bdc-settings-caret" />
                            {pluginSettings.name}
                        </span>
                    )}
                </span>
                {!pluginSettings && (
                    <ToolButton
                        label="Open Folder"
                        icon="Folder"
                        onClick={() => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`, new Error().stack)}
                    />
                )}
            </div>
            {pluginSettings ? <Boundary>{pluginSettings.element}</Boundary> : (
                <div className="bdc-addon-list">
                    {pendingUpdates.length ? <FormNotice
                        key="update-notice"     
                        type={FormNotice.Types.BRAND}
                        className="marginBottom20"
                        title={`Outdated ${type[0].toUpperCase() + type.slice(1)}${pendingUpdates.length > 1 ? "s" : ""}`}
                        imageData={{src: "/assets/6e97f6643e7df29b26571d96430e92f4.svg", width: 60, height: 60}}
                        body={<React.Fragment>
                            {`The following ${type}${pendingUpdates.length > 1 ? "s" : ""} needs to be updated:`}
                            <br />
                            {formatter.format(pendingUpdates)}
                        </React.Fragment>}
                    /> : null}
                    {manager.addons.map(addon => (
                        <AddonCard
                            key={addon.name}
                            addon={addon}
                            manager={manager}
                            type={type}
                            hasSettings={typeof addon.instance?.getSettingsPanel === "function"}
                            openSettings={() => {
                                let element;
                                try {element = addon.instance.getSettingsPanel.apply(addon.instance, []);}
                                catch (error) {
                                    Logger.error("Modals", `Cannot show addon settings modal for ${addon.name}:`, error);
                                    return void Toasts.show(`Unable to open settings panel for ${addon.name}.`, {type: "error"});
                                }
    
                                if (Element.prototype.isPrototypeOf(element)) element = React.createElement(DOMWrapper, {children: element});
                                else if (typeof (element) === "function") element = React.createElement(element, {});
    
                                // Bruh
                                if (!element) {
                                    Logger.error("Modals", `Unable to find settings panel for ${addon.name}`);
                                    return void Toasts.show(`Unable to open settings panel for ${addon.name}.`, {type: "error"});
                                }
                                
                                if (!element) return;
                                setPluginSettings({name: addon.name, element});
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}