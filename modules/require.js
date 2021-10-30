import electron from "./api/electron.js";
import fs from "./api/fs.js";
import path from "./api/path.js";
import request from "./api/request.js";

export default function (mod) {
    switch (mod) {
        case "fs": return fs;
        case "path": return path;
        case "request": return request;
        case "process": return process;
        case "electron": return electron;
    }
};