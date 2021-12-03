// @ts-nocheck

import {contextBridge} from "electron";

export function getKeys(object: object) {
    const keys = [];

    for (const key in object) keys.push(key);

    return keys;
};

export function cloneObject(target: any, newObject = {}, keys?: string[]) {
    if (!Array.isArray(keys)) keys = getKeys(target);
    
    return keys.reduce((clone, key) => {
        if (typeof (target[key]) === "object" && !Array.isArray(target[key]) && target[key] !== null) clone[key] = cloneObject(target[key], {});
        else if (typeof target[key] === "function") clone[key] = target[key].bind(target);
        else clone[key] = target[key];

        return clone;
    }, newObject);
};

export function exposeGlobal(key: string, namespace: any, {preload = true, renderer = true} = {}) {
    if (renderer) contextBridge.exposeInMainWorld(key, namespace);
    if (preload) window[key] = namespace;
};

Object.assign(window, {
    __cloneObject: cloneObject,
    __getKeys: getKeys
});