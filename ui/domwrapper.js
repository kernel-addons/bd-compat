import DiscordModules from "../modules/discord.js";

export default function DOMWrapper({children}) {
    const ref = DiscordModules.React.useRef();

    DiscordModules.React.useEffect(() => {
        if (!ref.current) return;

        ref.current.appendChild(children);
    }, [ref, children]);

    return DiscordModules.React.createElement("div", {className: "react-wrapper", ref});
}