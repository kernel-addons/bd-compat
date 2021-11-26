export default class Utilities {
    static metaSplitRegex = /[^\S\r\n]*?\r?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
    static escapeAtRegex = /^\\@/;

    static parseMETA(code) {
        const [firstLine] = code.split("\n");
        if (firstLine.startsWith("//META")) return this.parseOldMETA(code);
        if (firstLine.startsWith("/**")) return this.parseNewMETA(code);

        throw new Error("META was not found!");
    }

    static parseOldMETA(code) {
        const [firstLine] = code.split("\n");

        const parsed = JSON.parse(firstLine.slice(firstLine.indexOf("//META") + 6, firstLine.indexOf("*//")));
        parsed.format = "json";

        return parsed;
    }

    static parseNewMETA(code) {
        const block = code.split("/**", 2)[1].split("*/", 1)[0];
        const parsed = {format: "jsdoc"};
        let key = "";
        let value = "";

        for (const line of block.split(this.metaSplitRegex)) {
            if (!line.length) continue;
            if (line[0] === "@" && line[1] !== " ") {
                parsed[key] = value;
                const index = line.indexOf(" ");
                key = line.slice(1, index);
                value = line.slice(index + 1);
            } else {
                value += ` ${line.replace("\\n", "\n").replace(this.escapeAtRegex, "@")}`
            }
        }

        parsed[key] = value.trim();
        delete parsed[""];

        return parsed;
    }
}