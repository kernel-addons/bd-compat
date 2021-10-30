import DiscordModules from "../modules/discord.js";

export default () => class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }
    static getDerivedStateFromError(error) {
        return {hasError: true};
    }
    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return DiscordModules.React.createElement("span", {style: {color: "red"}}, "There was an error.");
        }
        return this.props.children;
    }
}