"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function getWorkspaceFolders() {
    return vscode.workspace.workspaceFolders;
}
exports.getWorkspaceFolders = getWorkspaceFolders;
function refreshExplorer() {
    return vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
}
exports.refreshExplorer = refreshExplorer;
function focusOpenEditors() {
    return vscode.commands.executeCommand('workbench.files.action.focusOpenEditorsView');
}
exports.focusOpenEditors = focusOpenEditors;
function showTextDocument(filepath) {
    return vscode.window.showTextDocument(vscode.Uri.file(filepath));
}
exports.showTextDocument = showTextDocument;
function promptForPassword(prompt) {
    return vscode.window.showInputBox({
        ignoreFocusOut: true,
        password: true,
        prompt,
    });
}
exports.promptForPassword = promptForPassword;
//# sourceMappingURL=host.js.map