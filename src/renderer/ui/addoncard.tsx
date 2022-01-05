import DiscordModules from "../modules/discord"
import Modals from "../modules/modals";
import Utilities from "../modules/utilities";
import Components from "./components";
import ColorPalette from "./icons/color-palette";
import Extension from "./icons/extension";
import "./addoncard.scss";
import Globe from "./icons/globe";
import Github from "./icons/github";
import Help from "./icons/help";
import Donate from "./icons/donate";
import Patreon from "./icons/patreon";
import Logger from "../modules/logger";
import Toasts from "../modules/toasts";
import {useUpdaterStore} from "../stores/updater";

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
        className: Utilities.joinClassNames("bd-toolbutton", [danger, "bd-danger"]),
        look: Button.Looks.BLANK,
        size: Button.Sizes.NONE,
        onClick: onClick,
        disabled
    }, React.createElement(Icon, {name: icon, width: 20, height: 20})));
};

export function ButtonWrapper({value, onChange, disabled = false}) {
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

export function ClickableName({addon}) {
    const isLink = React.useMemo(() => {
        return addon.authorId != null || addon.authorLink != null;
    }, [addon]);
    const Tag = isLink ? "a" : "span";

    const handleClick = function () {
        if (addon.authorId) {
            return DiscordModules.PrivateChannelActions.ensurePrivateChannel(addon.authorId)
                .then(() => {
                    DiscordModules.PrivateChannelActions.openPrivateChannel(addon.authorId)
                })
                .catch(() => {});
        } else {
            window.open(addon.authorLink, "_blank");
        }
    }

    return (
        <div className="bd-addon-author">
            <span className="bd-author-text"> by </span>
            {
                addon.author?.split(/\s?,\s?/).map((author: string, index: number, authors: string[]) => (
                    <React.Fragment key={author}>
                        <Tag className="bd-link" onClick={handleClick}>{author}</Tag>
                        {index < authors.length - 1 && <span className="bd-comma">, </span>}
                    </React.Fragment>
                )) ?? "Unknown"
            }
        </div>
    );
}

export const IconsMap = {
    website: {
        icon: Globe,
        label: "Website"
    },
    source: {
        icon: Github,
        label: "Source"
    },
    invite: {
        icon: Help,
        label: "Support Server"
    },
    donate: {
        icon: Donate,
        label: "Donate"
    },
    patreon: {
        icon: Patreon,
        label: "Patreon"
    }
};

export function SupportIcons({addon}) {
    const Button = Components.byProps("DropdownSizes");
    
    const openSupportServer = async function () {
        console.log("open?");
        try {
            const data = await DiscordModules.InviteActions.resolveInvite(addon.invite);
            console.log({data});
            DiscordModules.Dispatcher.dispatch({
                type: "INVITE_MODAL_OPEN",
                code: addon.invite,
                invite: data,
                context: "APP"
            });
        } catch (error) {
            Logger.error("InviteManager", `Failed to resolve invite for ${addon.name}:`, error);
            Toasts.show("Could not resolve invite.", {type: "error"});
        }
    };

    return (
        <React.Fragment>
            {
                Object.entries(IconsMap).map(([type, props]) => {
                    if (!addon[type]) return null;
                    const {icon: Icon, label} = props;
            
                    const handleClick = function () {
                        window.open(addon[type]);
                    };
            
            
                    return (
                        <DiscordModules.Tooltips.default text={label} position="top" key={type}>
                            {props => (
                                <Button
                                    {...props}
                                    look={Button.Looks.BLANK}
                                    size={Button.Sizes.NONE}
                                    onClick={type === "invite" ? openSupportServer : handleClick}
                                    className="bd-addon-support-button"
                                >
                                    <Icon width="20" height="20" />
                                </Button>
                            )}
                        </DiscordModules.Tooltips.default>
                    );
                })
            }
        </React.Fragment>
    );
}

export default function AddonCard({addon, manager, openSettings, hasSettings, type}) {
    const {React} = DiscordModules;
    const [, forceUpdate] = React.useReducer(n => n + 1, 0);
    const Markdown = Components.get("Markdown", e => "rules" in e);
    const pendingUpdate = useUpdaterStore(s => s.updates[addon.name]);

    React.useEffect(() => {
        return manager.on("toggled", (name: string) => {
            if (name !== addon.name) return;
            forceUpdate();
        });
    }, [addon, manager]); 

    return (
        <div className={Utilities.joinClassNames("bd-addon-card")} data-addon={addon.name}>
            <div className="bd-addoncard-header">
                <div className="bd-addoncard-info">
                    <div className="bd-addoncard-icon">
                        {type === "theme" ? <ColorPalette /> : <Extension />}
                    </div>
                    <div className="bd-addon-name">{addon.name ?? "???"}</div>
                    <span className="bd-addon-version">
                        {"v" + (addon.version ?? "Unknown")}
                    </span>
                    <ClickableName addon={addon} />
                </div>
                <ButtonWrapper
                    value={manager.isEnabled(addon)}
                    onChange={() => {
                        manager.toggleAddon(addon);
                    }}
                />
            </div>
            <div className="bd-addon-description">
                <Markdown>{addon.description ?? `This ${type} has no description specified.`}</Markdown>
            </div>
            <div className="bd-addon-footer">
                <div className="bd-support-bar">
                    <SupportIcons addon={addon} />
                </div>
                <div className="bd-toolbar">
                    {pendingUpdate && (
                        <ToolButton
                            label="Download Update"
                            icon="Download"
                            onClick={() => pendingUpdate.update()}
                        />
                    )}
                    <ToolButton
                        label="Settings"
                        icon="Gear"
                        disabled={!hasSettings || !manager.isEnabled(addon)}
                        onClick={openSettings}
                    />
                    <ToolButton
                        label="Reload"
                        icon="Replay"
                        onClick={() => manager.reloadAddon(addon)}
                    />
                    <ToolButton
                        label="Open Path"
                        icon="Folder"
                        onClick={() => {
                            BDCompatNative.executeJS(`require("electron").shell.showItemInFolder(${JSON.stringify(addon.path)})`, new Error().stack);
                        }}
                    />
                    <ToolButton
                        danger
                        label="Delete"
                        icon="Trash"
                        onClick={() => {
                            Modals.showConfirmationModal("Are you sure?", `Are you sure that you want to delete the ${type} "${addon.name}"?`, {
                                onConfirm: () => {
                                    BDCompatNative.executeJS(`require("electron").shell.trashItem(${JSON.stringify(addon.path)})`, new Error().stack);
                                }
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}