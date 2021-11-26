import DiscordModules from "../modules/discord.js"
import Modals from "../modules/modals.js";
import Components from "./components.js";

export function Icon({name, ...props}) {
    const Component = Components.get(name);
    if (!Components) return null;

    return React.createElement(Component, props);
};

export function ToolButton({label, icon, onClick, danger = false, disabled = false}) {
    const Button = Components.byProps("DropdownSizes");

    return React.createElement(Components.get("Tooltip"), {
        text: label,
        position: "top"
    }, props => React.createElement(Button, {
        ...props,
        className: "bdcompat-toolbutton",
        look: Button.Looks.BLANK,
        size: Button.Sizes.NONE,
        onClick: onClick,
        disabled
    }, React.createElement(Icon, {name: icon, color: danger ? "#ed4245" : void 0, width: 20, height: 20})));
};

export function ButtonWrapper({value, onChange, disabled}) {
    const {React} = DiscordModules;
    const [isChecked, setChecked] = React.useState(value);

    return React.createElement(Components.get("Switch"), {
        checked: isChecked,
        disabled,
        onChange: () => {
            onChange(!isChecked);
            setChecked(!isChecked);
        }
    });
};

export default function AddonCard({addon, manager, openSettings, hasSettings, type}) {
    const {React} = DiscordModules;
    const [, forceUpdate] = React.useReducer(n => n + 1, 0);

    React.useEffect(() => {
        return manager.on("toggled", name => {
            if (name !== addon.name) return;
            forceUpdate();
        });
    }, [addon, manager]);

    return React.createElement("div", {
        className: "bdcompat-addon-card " + addon.name.replace(/ /g, "-"),
        children: [
            React.createElement("div", {
                className: "bdcompat-card-tools",
                children: [
                    React.createElement(ToolButton, {
                        label: "Settings",
                        icon: "Gear",
                        disabled: !hasSettings,
                        onClick: openSettings
                    }),
                    React.createElement(ToolButton, {
                        label: "Reload",
                        icon: "Replay",
                        onClick: () => manager.reloadAddon(addon)
                    }),
                    React.createElement(ToolButton, {
                        label: "Open Path",
                        icon: "Folder",
                        onClick: () => {
                            BDCompatNative.executeJS(`require("electron").shell.showItemInFolder(${JSON.stringify(addon.path)})`);
                        }
                    }),
                    React.createElement(ToolButton, {
                        label: "Delete",
                        icon: "Trash",
                        danger: true,
                        onClick: () => {
                            Modals.showConfirmationModal("Are you sure?", `Are you sure that you want to delete the ${type} "${addon.name}"?`, {
                                onConfirm: () => {
                                    BDCompatNative.executeJS(`require("electron").shell.trashItem(${JSON.stringify(addon.path)})`);
                                }
                            });
                        }
                    })
                ]
            }),
            React.createElement("div", {
                className: "bdcompat-card-header",
                children: [
                    React.createElement("div", {className: "bdcompat-card-name", }, addon.name),
                    "version" in addon && React.createElement("div", {className: "bdcompat-card-version"}, "v" + addon.version),
                    "author" in addon && React.createElement("div", {className: "bdcompat-card-author"}, "by " + addon.author)
                ]
            }),
            addon.description && React.createElement("div", {
                className: "bdcompat-card-desc",
            }, React.createElement(Components.get("Markdown", e => "rules" in e), null, addon.description)),
            React.createElement("div", {
                className: "bdcompat-footer",
                children: React.createElement(ButtonWrapper, {
                    value: manager.isEnabled(addon),
                    onChange: () => {
                        manager.toggleAddon(addon);
                    }
                })
            })
        ]
    });
}