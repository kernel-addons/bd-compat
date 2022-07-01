import type {UpdaterNode} from "../../modules/addonupdater";
import DiscordModules from "../../modules/discord";
import {UpdaterApi, useUpdaterStore} from "../../stores/updater";
import Addon from "../icons/addon";
import Install from "../icons/install";
import Remove from "../icons/remove";
import "./panel.scss";

type Update = {type: "theme" | "plugin", data: UpdaterNode};

const actions = [
    {
        tooltip: "Remove",
        get children() {return <Remove />;},
        onClick(addon: Update) {
            UpdaterApi.setState(prev => {
                const name = addon.data.addon.name;

                delete prev.updates[name];

                return Object.assign({}, prev);
            });
        }
    },
    {
        tooltip: "Install",
        get children() {return <Install />;},
        onClick(addon: Update) {
            addon.data.update(true);
        }
    }
];

function ControlButton({onClick, tooltip, children}) {
    return (
        <DiscordModules.Tooltips.default text={tooltip} position="right">
            {props => (
                <div {...props} className="updater-update-control-button" onClick={onClick}>
                    {children}
                </div>
            )}
        </DiscordModules.Tooltips.default>
    );
}

export function UpdateItem({update}: {update: Update}) {
    return (
        <div className="update-item">
            <Addon type={update.type} className="update-item-icon" />
            <span className="update-item-label">{update.data.addon.name}</span>
            <div className="bd-update-controls">
                {actions.map(btn => <ControlButton {...btn} onClick={btn.onClick.bind(null, update)} />)}
            </div>
        </div>
    )
}

export default function UpdaterPanel() {
    const updates = useUpdaterStore(state => Object.values(state.updates));

    return (
        <div className="updater-panel">
            <div className="updater-updates-list">
                {updates.map(update => (
                    <UpdateItem update={update} key={update.data?.addon?.name} />
                ))}
            </div>
        </div>
    );
}
