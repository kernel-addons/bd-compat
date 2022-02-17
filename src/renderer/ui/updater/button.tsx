import DiscordModules from "../../modules/discord";
import Toasts from "../../modules/toasts";
import {UpdaterApi, useUpdaterStore} from "../../stores/updater";
import DiscordProviders from "../discordproviders";
import BDLogo from "../icons/bdlogo";
import "./button.scss";

export function UpdaterContextMenu() {
    const {ContextMenu} = DiscordModules;

    return (
        <ContextMenu.Menu navId="UpdaterContextMenu" onClose={ContextMenu.close}>
            <ContextMenu.Item
                label="Update All"
                id="update-all"
                action={async () => {
                    const updates = Object.values<any>(UpdaterApi.getState().updates);

                    for (let i = 0; i < updates.length; i++) {
                        updates[i]?.data?.update(false);
                    }
                }}
            />
            <ContextMenu.Item
                label="Skip Updates"
                id="skip-updates"
                action={() => {
                    UpdaterApi.setState({updates: {}});
                    Toasts.show("Updates Skipped!", {type: "success"});
                }}
            />
        </ContextMenu.Menu>
    );
}

export default function UpdaterButton() {
    const {ContextMenu} = DiscordModules;
    const count = useUpdaterStore(state => Object.keys(state.updates).length);

    if (count < 1) return null;

    const handleContextMenu = function (event: React.MouseEvent) {
        ContextMenu.open(event, UpdaterContextMenu);
    };

    return (
        <DiscordProviders>
            <DiscordModules.Tooltips.default text={`${count} update${count > 1 ? "s" : ""} available!`} position="left">
                {props => (
                    <div {...props} className="bd-updater-button" onClick={() => {}} onContextMenu={handleContextMenu} data-updates={count}>
                        <BDLogo width="28" height="28" />
                    </div>
                )}
            </DiscordModules.Tooltips.default>
        </DiscordProviders>
    );
}

// @ts-ignore
window.BDUpdater = {useUpdaterStore};