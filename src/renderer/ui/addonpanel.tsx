import SettingsManager from "../modules/settingsmanager";
import DiscordModules from "../modules/discord";
import memoize from "../modules/actualmemoize";
import Webpack from "../modules/webpack";
import Components from "./components";
import DOMWrapper from "./domwrapper";

import SearchIcon from "./icons/search";
import Arrow from "./icons/downarrow";
import Magnify from "./icons/magnify";
import AddonCard from "./addoncard";
import ListIcon from "./icons/list";
import GridIcon from "./icons/grid";

import "./addonpanel.scss";
import "./addons.scss";

export default function AddonPanel({type, manager}) {
    const {React} = DiscordModules;

    const forceUpdate = React.useState({})[1];

    React.useEffect(() => {
        function onChange() {
            forceUpdate({})
        }

        manager.on("updated", onChange);
        return () => manager.off("updated", onChange);
    }, [])

    const [query, setQuery] = React.useState("");
    const [settings, setSettings] = React.useState({ name: null, component: null });
    const [ascending, setAscending] = React.useState(SettingsManager.states.manager?.[type]?.ascending ?? true);
    const [sort, setSort] = React.useState(SettingsManager.states.manager?.[type]?.sort ?? "name");
    const [view, setView] = React.useState(SettingsManager.states.manager?.[type]?.view ?? "list")

    const name = type[0].toUpperCase() + type.slice(1) + "s";

    const addons = manager.addons;
    let sortedAddons = addons.sort((a, b) => {
        const first = a[sort];
        const second = b[sort];
        const stringSort = (str1, str2) => str1.toLocaleLowerCase().localeCompare(str2.toLocaleLowerCase());
        if (typeof(first) == "string") return stringSort(first, second);
        if (typeof(first) == "boolean") return (first === second) ? stringSort(a.name, b.name) : first ? -1 : 1;
        if (first > second) return 1;
        if (second > first) return -1;
        return 0;
    });

    if (!ascending) sortedAddons.reverse();

    if (query) {
        sortedAddons = sortedAddons.filter(addon => {
            let matches = addon.name.toLocaleLowerCase().includes(query);
            matches = matches || addon.author.toLocaleLowerCase().includes(query);
            matches = matches || addon.description.toLocaleLowerCase().includes(query);
            if (!matches) return false;
            return true;
        });
    }

    const noAddons = !addons.length;
    const hasResults = query && sortedAddons.length;

    const Caret = Components.get("Arrow");

    return (<>
        <h2 className={"bd-settings-title" + (settings?.name ? " has-settings" : "")}>
            <div onClick={() => setSettings({ name: null, component: null })} className="bd-settings-title-text">
                {name}
            </div>
            {!settings?.name ? <button
                onClick={() => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`, new Error().stack)}
                className="bd-button bd-button-title"
            >
                Open {name} Folder
            </button> : <div className="bd-settings-title-settings">
                <Caret className="bd-settings-title-caret" direction="RIGHT" />
                {settings.name}
            </div>}
        </h2>
        {!settings?.name && <div className="bd-controls bd-addon-controls">
            <Search
                value={query}
                onChange={e => setQuery(e.target.value.toLowerCase())}
                placeholder={`Search ${name.toLowerCase()}...`}
            />
            <div className="bd-controls-advanced">
                <div className="bd-addon-dropdowns">
                    <div className="bd-select-wrapper">
                        <label className="bd-label">Sort By:</label>
                        <Dropdown
                            options={[
                                {
                                    label: "Name",
                                    value: "name"
                                },
                                {
                                    label: "Author",
                                    value: "author"
                                },
                                {
                                    label: "Version",
                                    value: "version"
                                }
                            ]}
                            value={sort}
                            onChange={(value) => {
                                const manager = SettingsManager.states.manager ?? {};
                                manager[type] ??= {};
                                manager[type]["sort"] = value;
                                SettingsManager.setSetting("manager", manager);

                                setSort(value);
                            }}
                        />
                    </div>
                    <div className="bd-select-wrapper">
                        <label className="bd-label">Order:</label>
                        <Dropdown
                            options={[
                                {
                                    label: "Ascending",
                                    value: true
                                },
                                {
                                    label: "Descending",
                                    value: false
                                }
                            ]}
                            value={ascending}
                            onChange={(value) => {
                                const manager = SettingsManager.states.manager ?? {};
                                manager[type] ??= {};
                                manager[type]["ascending"] = value;
                                SettingsManager.setSetting("manager", manager);

                                setAscending(value);
                            }}
                        />
                    </div>
                </div>
                <div className="bd-addon-views">
                    <ControlButton
                        name="List View"
                        selected={view === "list"}
                        icon={<ListIcon />}
                        onClick={() => {
                            const manager = SettingsManager.states.manager ?? {};
                            manager[type] ??= {};
                            manager[type]["view"] = "list";
                            SettingsManager.setSetting("manager", manager);

                            setView("list");
                        }}
                    />
                    <ControlButton
                        name="Grid View"
                        selected={view === "grid"}
                        icon={<GridIcon />}
                        onClick={() => {
                            const manager = SettingsManager.states.manager ?? {};
                            manager[type] ??= {};
                            manager[type]["view"] = "grid";
                            SettingsManager.setSetting("manager", manager);

                            setView("grid");
                        }}
                    />
                </div>
            </div>
        </div>}
        {settings?.name ? (() => {
            const Component = settings.component();
            if (React.isValidElement(Component)) {
                return Component;
            } else {
                return <DOMWrapper>
                    {Component}
                </DOMWrapper>
            }
        })() : noAddons ? <div className="bd-empty-image-container">
            <div className="bd-empty-image" />
            <div className="bd-empty-image-header">
                You don't have any {type + "s"}!
            </div>
            <div className="bd-empty-image-message">
                Grab some from <a href={`https://betterdiscord.app/${type + "s"}`} className="bd-link" target="_blank" rel="noopener noreferrer">this website</a> and add them to your {type} folder.
            </div>
            <button
                onClick={() => BDCompatNative.executeJS(`require("electron").shell.openPath(${JSON.stringify(manager.folder)})`, new Error().stack)}
                className="bd-button"
            >
                Open {name} Folder
            </button>
        </div> : !sortedAddons.length && !hasResults ? <div className="bd-empty-image-container">
            <Magnify width={160} height={160} />
            <div className="bd-empty-image-header">
                Not Found
            </div>
            <div className="bd-empty-image-message">
                We couldn't find any {type + "s"} matching your query.
            </div>
        </div> : <div className={"bd-addon-list" + (view == "grid" ? " bd-grid-view" : "")}>
            {sortedAddons.map(a => <AddonCard
                addon={a}
                type={type}
                openSettings={() => setSettings({ name:a.name, component: a.instance?.getSettingsPanel.bind(a.instance) })}
                hasSettings={a.instance?.getSettingsPanel}
                manager={manager}
            />)}
        </div>}
    </>);
}

function Dropdown({ options, value: defaultValue, onChange }) {
    const {React} = DiscordModules;

    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(defaultValue);
    const selected = options.find(o => o.value == value);

    function show(event) {
        event?.preventDefault();
        event?.stopPropagation();

        const value = !open;
        setOpen(value);

        if(value) {
            document.addEventListener("click", hide);
        }
    }

    function hide() {
        setOpen(false);
        document.removeEventListener("click", hide);
    }

    React.useEffect(() => {
        return () => document.removeEventListener("click", hide);
    }, [])

    return <div className={`bd-select bd-select-transparent ${open ? " menu-open" : ""}`} onClick={show}>
        <div className="bd-select-value">
            {selected.label}
        </div>
        <Arrow width={16} height={16} className="bd-select-arrow" />
        {open && <div className="bd-select-options">
            {options.map(opt =>
                <div
                    className={`bd-select-option${selected.value == opt.value ? " selected" : ""}`}
                    onClick={() => {
                        setValue(opt.value);
                        onChange?.(opt.value);
                    }}
                >
                    {opt.label}
                </div>
            )}
        </div>}
    </div>;
}

const getTooltip = memoize(() => Webpack.findByDisplayName("Tooltip"))
function ControlButton({ name, selected, icon, onClick }) {
    const Tooltip = getTooltip();
    return <Tooltip color="primary" position="top" text={name}>
        {(props) => {
            return <button {...props} className={"bd-button bd-view-button" + (selected ? " selected" : "")} onClick={onClick}>
                {icon}
            </button>;
        }}
    </Tooltip>;
}

function Search(props) {
    const [query, setQuery] = React.useState(props.value);

    return <div className={"bd-search-wrapper" + (props.className ? ` ${props.className}` : "")}>
        <input
            onKeyDown={props.onKeyDown}
            type="text"
            className="bd-search"
            placeholder={props.placeholder}
            maxLength="50"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                if (props.onChange) props.onChange(e);
            }}
        />
        <SearchIcon width={16} height={16} />
    </div>;
}