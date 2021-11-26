import DiscordModules from "../modules/discord.js";

export function Toast({type, children, timeout, onRemove}) {
    const {React} = DiscordModules;
    const [closing, setClosing] = React.useState(false);

    const remove = React.useCallback(() => {
        setClosing(true);
        setTimeout(() => onRemove(), 300);
    }, [onRemove, closing]);

    React.useEffect(() => {
        setTimeout(() => remove(), timeout);
    }, [timeout]);
    
    return React.createElement("div", {
        className: ["bd-toast", type && ["icon", "toast-" + type], closing && "closing"].filter(Boolean).flat(10).join(" "),
        onClick: event => {
            if (!event.shiftKey) return;

            remove();
        }
    }, children);
}

export default function ToastsContainer({useStore, setState}) {
    const {React} = DiscordModules;
    const elements = useStore(state => state.toasts);
    
    return React.createElement(React.Fragment, null, elements.map((element) => React.createElement(Toast, {
        key: element.id,
        onRemove: () => {
            setState(state => {
                const index = state.toasts.indexOf(element);
                if (index < 0) return;

                return {
                    ...state,
                    toasts: state.toasts.slice(0, index).concat(state.toasts.slice(index + 1))
                };
            });
        },
        children: element.content,
        timeout: element.timeout,
        type: element.type
    })));
}