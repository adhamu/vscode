"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upath_1 = require("../modules/upath");
const path = require("path");
function toRemote(relativePath, remoteContext) {
    return upath_1.default.join(remoteContext, relativePath);
}
exports.toRemote = toRemote;
function toLocal(relativePath, localContext) {
    return path.join(localContext, relativePath);
}
exports.toLocal = toLocal;
function isSubpathOf(subpath, pathname) {
    return path.normalize(pathname).indexOf(path.normalize(subpath)) === 0;
}
exports.isSubpathOf = isSubpathOf;
//# sourceMappingURL=paths.js.map