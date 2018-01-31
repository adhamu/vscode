"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants");
let config;
let configInvalid = false;
vscode.workspace.onDidChangeConfiguration(_ => {
    configInvalid = true;
});
function getConfig() {
    if (config === undefined || configInvalid) {
        config = vscode.workspace.getConfiguration(constants_1.EXTENSION_NAME);
    }
    return config;
}
exports.getConfig = getConfig;
//# sourceMappingURL=editorConfig.js.map