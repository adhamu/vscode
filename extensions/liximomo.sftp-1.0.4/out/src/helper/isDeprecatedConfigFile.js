"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const constants_1 = require("../constants");
function isConfigFile(fspath) {
    const filename = path.basename(fspath);
    return filename === constants_1.DEPRECATED_CONGIF_FILENAME;
}
exports.default = isConfigFile;
//# sourceMappingURL=isDeprecatedConfigFile.js.map