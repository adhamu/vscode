'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const child_process_1 = require("child_process");
function registerCommands(context) {
    let openInSublimeMerge = vscode.commands.registerCommand('vscsm.openInSublimeMerge', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            runSublimeMerge(['.'], editor.document.uri);
        }
    });
    let blameInSublimeMerge = vscode.commands.registerCommand('vscsm.blameInSublimeMerge', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selectionInfo = editor.selection;
            runSublimeMerge(['blame', editor.document.fileName, String(selectionInfo.start.line)], editor.document.uri);
        }
    });
    let fileHistoryInSublimeMerge = vscode.commands.registerCommand('vscsm.fileHistoryInSublimeMerge', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const relativeFilePath = vscode.workspace.asRelativePath(editor.document.uri, false);
            getGitConfig('user.name', editor.document.uri);
            runSublimeMerge(['search', 'file:"' + relativeFilePath], editor.document.uri);
        }
    });
    let lineHistoryInSublimeMerge = vscode.commands.registerCommand('vscsm.lineHistoryInSublimeMerge', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selectionInfo = editor.selection;
            const relativeFilePath = vscode.workspace.asRelativePath(editor.document.uri, false);
            const searchQuery = 'file:"' +
                relativeFilePath +
                '" line:' +
                String(selectionInfo.start.line + 1) +
                '-' +
                String(selectionInfo.end.line + 1);
            runSublimeMerge(['search', searchQuery], editor.document.uri);
        }
    });
    let myCommitsInSublimeMerge = vscode.commands.registerCommand('vscsm.myCommitsInSublimeMerge', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const gitUsername = getGitConfig('user.name', editor.document.uri);
            if (!gitUsername) {
                vscode.window.showWarningMessage('Failed to determine your git username from your configuration');
                return;
            }
            runSublimeMerge(['search', 'author:"' + gitUsername + '"'], editor.document.uri);
        }
    });
    context.subscriptions.push(openInSublimeMerge);
    context.subscriptions.push(blameInSublimeMerge);
    context.subscriptions.push(fileHistoryInSublimeMerge);
    context.subscriptions.push(lineHistoryInSublimeMerge);
    context.subscriptions.push(myCommitsInSublimeMerge);
}
exports.registerCommands = registerCommands;
function runSublimeMerge(args, currentDocumentURI) {
    if (currentDocumentURI.scheme === 'file') {
        const path = getWorkspaceFolderPath(currentDocumentURI);
        if (!path) {
            return null;
        }
        child_process_1.execFile('smerge', args, { cwd: path });
    }
}
function getWorkspaceFolderPath(currentDocumentURI) {
    const folder = vscode.workspace.getWorkspaceFolder(currentDocumentURI);
    if (!folder) {
        return null;
    }
    return folder.uri.fsPath;
}
function getGitConfig(param, currentDocumentURI) {
    const path = getWorkspaceFolderPath(currentDocumentURI);
    if (!path) {
        return null;
    }
    let output;
    try {
        output = child_process_1.execFileSync('git', ['config', param], { cwd: path });
    }
    catch (e) {
        console.log('Error while reading Git config (' + param + '): ' + e);
        return null;
    }
    return output.toString().trimRight();
}
//# sourceMappingURL=commands.js.map