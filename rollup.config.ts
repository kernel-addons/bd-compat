import swc from "rollup-plugin-swc";
import {defineConfig} from "rollup";
import esFormatter from "rollup-plugin-esformatter";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import scss from "rollup-plugin-scss";
import {uglify} from "rollup-plugin-uglify";


export default args => {
    const {mode = "renderer", minify = true} = args;
    delete args.mode;
    delete args.minify;

    return defineConfig({
        input: `./src/${mode}/index.ts`,
        external: ["electron", "fs", "path", "module", "sucrase", "sass", "inspector"],
        output: {
            format: mode === "renderer" ? "esm" : "commonjs",
            file: `./dist/${mode}.js`
        },

        plugins: [
            minify && uglify(),
            scss({
                output: "./dist/style.css",
                // @ts-ignore
                runtime: require("sass")
            }),
            json(),
            nodeResolve({
                browser: mode === "renderer",
                extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
                preferBuiltins: false
            }),
            swc({
                jsc: {
                    parser: {
                        tsx: true,
                        syntax: "typescript",
                        decorators: true
                    },
                    target: "es2022"
                }
            })
        ].filter(Boolean)
    });
};
