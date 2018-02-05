"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GitIgnore = require("ignore");
class Ignore {
    static from(pattern) {
        return new Ignore(pattern);
    }
    constructor(pattern) {
        this.ignore = GitIgnore();
        this.pattern = pattern;
        this.ignore.add(pattern);
    }
    ignores(pathname) {
        return this.ignore.ignores(pathname);
    }
    createFilter() {
        return this.ignore.createFilter();
    }
}
exports.default = Ignore;
//# sourceMappingURL=Ignore.js.map