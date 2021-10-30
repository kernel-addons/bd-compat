import DiscordModules from "../modules/discord.js"
import AddonCard, {ToolButton} from "./addoncard.js";

export default function AddonPanel({type, manager}) {
    const {React} = DiscordModules;

    return React.createElement("div", {
        className: "bdcompat-addon-panel type-" + type,
        children: [
            React.createElement("div", {
                className: "bdcompat-title",
                children: [
                    type[0].toUpperCase() + type.slice(1) + "s",
                    React.createElement(ToolButton, {
                        label: "Open Folder",
                        icon: "Folder",
                        onClick: () => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`)
                    })
                ]
            }),
            React.createElement("div", {
                className: "bdcompat-addon-panel-list"
            }, manager.addons.map(addon => React.createElement(AddonCard, {addon, manager, type, key: addon.name})))
        ]
    }); 
}