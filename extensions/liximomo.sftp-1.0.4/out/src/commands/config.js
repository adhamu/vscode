"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const config_1 = require("../modules/config");
const createCommand_1 = require("../helper/createCommand");
const host_1 = require("../host");
function editConfig() {
    const workspaceFolders = host_1.getWorkspaceFolders();
    if (workspaceFolders.length === 1) {
        config_1.newConfig(workspaceFolders[0].uri.fsPath);
        return;
    }
    const initDirs = workspaceFolders.map(folder => ({
        value: folder.uri.fsPath,
        label: folder.name,
        description: folder.uri.fsPath,
    }));
    vscode.window
        .showQuickPick(initDirs, {
        ignoreFocusOut: true,
        placeHolder: 'Select a folder...(ESC to cancel)',
    }).then(item => {
        if (item === undefined) {
            return;
        }
        config_1.newConfig(item.value);
    });
}
exports.default = createCommand_1.default(editConfig);
//# sourceMappingURL=config.js.map