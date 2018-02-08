"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const host_1 = require("../host");
function checkRequire(cmd) {
    return (...args) => {
        const workspaceFolders = host_1.getWorkspaceFolders();
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('The SFTP extension requires to work with an opened folder.');
            return;
        }
        cmd(...args);
    };
}
exports.default = checkRequire;
//# sourceMappingURL=checkRequire.js.map