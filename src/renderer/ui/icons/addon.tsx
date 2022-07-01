import ColorPalette from "./color-palette";
import Extension from "./extension";

export default function Addon(props: {type: "plugin" | "theme", className?: string}) {
    switch (props.type) {
        case "plugin": return <Extension {...props} />;
        case "theme": return <ColorPalette {...props} />

        default: return null;
    }
}
