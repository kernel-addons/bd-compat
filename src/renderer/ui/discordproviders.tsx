import DiscordModules from "../modules/discord";

export default function DiscordProviders({children}) {
    const {AccessibilityProvider, LayerProvider, container} = DiscordModules.DiscordProviders;

    return React.createElement(AccessibilityProvider, {
        value: {
            reducedMotion: {value: false, rawValue: "no-preference"}
        }
    }, React.createElement(LayerProvider, {
        value: [container]
    }, children));
}
