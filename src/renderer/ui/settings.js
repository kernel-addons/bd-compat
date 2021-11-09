import DiscordModules from "../modules/discord.js";

export default function SettingsPanel() {
    return DiscordModules.React.createElement("div", {
        className: "bdcompat-settings-panel",
        children: [
            DiscordModules.React.createElement("div", {
                className: "bdcompat-title"
            }, "Settings"),
            DiscordModules.React.createElement("p", {}, "Settings :)")
        ]
    });
}