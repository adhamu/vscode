"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs_extra_1 = require("fs-extra");
const config_1 = require("./config");
function initConfigFile() {
    if (!vscode.workspace.rootPath) {
        vscode.window.showErrorMessage("Ftp-sync: Cannot init ftp-sync without opened folder");
        return;
    }
    const defaultConfigPath = config_1.getDefaultConfigPath();
    const showConfigFile = () => vscode.workspace.openTextDocument(defaultConfigPath)
        .then(vscode.window.showTextDocument);
    fs_extra_1.default.pathExists(defaultConfigPath)
        .then(exist => {
        if (exist) {
            return showConfigFile();
        }
        return fs_extra_1.default.writeJson(defaultConfigPath, config_1.defaultConfig)
            .then(showConfigFile);
    })
        .catch(error => {
        vscode.window.showErrorMessage('[config fail]:', error.message);
    });
}
exports.default = initConfigFile;
//# sourceMappingURL=init-config.js.map