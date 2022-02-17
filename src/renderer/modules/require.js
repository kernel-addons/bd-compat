import electron from "./api/electron.js";
import EventEmitter from "./api/events.js";
import fs from "./api/fs";
import path from "./api/path.js";
import request from "./api/request.js";
import * as https from "./api/https.js";
import mimeTypes from "./api/mime-types.ts";
import url from "./api/url.ts";
import os from "./api/os";
import Buffer from "./api/buffer";

export default (window.process?.contextIsolated ?? true) ? function (mod) {
    switch (mod) {
        case "fs": return fs;
        case "path": return path;
        case "request": return request;
        case "process": return process;
        case "electron": return electron;
        case "events": return EventEmitter;
        case "http":
        case "https": return https;
        case "mime-types": return mimeTypes;
        case "url": return url;
        case "os": return os;
        case "buffer": return Buffer;

        default: console.warn(`${mod} was not found!`);
    }
} : window.require;