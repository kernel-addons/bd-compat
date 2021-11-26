import DiscordModules from "./discord.js";

/**
 * Creates a updateable react store with a remote api.
 * @param {Any} state Intitial State of your store
 * @returns {[(factory = _ => _) => JSON.Element, Api]}
 */
export default function createStore(state) {
    const {useEffect, useReducer} = DiscordModules.React;
    const listeners = new Set();

    const Api = Object.freeze({
        get listeners() {return listeners;},
        getState(factory = _ => _) {return factory(state);},
        setState(partial) {
            const partialState = typeof partial === "function" ? partial(state) : partial;
            if (_.isEqual(state, partialState)) return;
            state = Object.assign({}, state, partialState);
            listeners.forEach(listener => {
                listener(state);
            });
        },
        addListener(listener) {
            if (listeners.has(listener)) return;
            listeners.add(listener);

            return () => listeners.delete(listener);
        },
        removeListener(listener) {
            return listeners.delete(listener);
        }
    });

    function useState(factory = _ => _) {
        const [, forceUpdate] = useReducer(e => e + 1, 0);

        useEffect(() => {
            const handler = () => forceUpdate();

            listeners.add(handler);

            return () => listeners.delete(handler);
        }, []);

        return Api.getState(factory);
    }

    Object.assign(useState, Api, {
        *[Symbol.iterator]() {
            yield useState;
            yield Api;
        }
    });

    return useState;
}