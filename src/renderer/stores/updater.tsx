import createStore from "../modules/zustand";

const [useUpdaterStore, UpdaterApi] = createStore({updates: {}});

export {useUpdaterStore, UpdaterApi};