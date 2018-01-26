'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const output = require("./modules/output");
const config_1 = require("./modules/config");
// TODO
const remoteFs_1 = require("./modules/remoteFs");
const fileWatcher_1 = require("./modules/fileWatcher");
// import traceFileActivities from './modules/fileActivities.js';
const sync_1 = require("./commands/sync");
const list_1 = require("./commands/list");
const config_2 = require("./commands/config");
const auto_save_1 = require("./commands/auto-save");
const constants_1 = require("./constants");
const host_1 = require("./host");
function registerCommand(context, name, callback, thisArg) {
    const disposable = vscode.commands.registerCommand(name, callback, thisArg);
    context.subscriptions.push(disposable);
}
function handleConfigSave(uri) {
    config_1.loadConfig(uri.fsPath)
        .then(fileWatcher_1.watchFiles, output.onError);
}
function handleDocumentSave(uri) {
    auto_save_1.default(uri);
}
;
function setupWorkspaceFolder(dir) {
    return config_1.initConfigs(dir).then(fileWatcher_1.watchFiles);
}
function setup() {
    fileWatcher_1.watchWorkspace({
        onDidSaveFile: handleDocumentSave,
        onDidSaveSftpConfig: handleConfigSave,
    });
    const workspaceFolders = host_1.getWorkspaceFolders();
    const pendingInits = workspaceFolders.map(folder => setupWorkspaceFolder(folder.uri.fsPath));
    return Promise.all(pendingInits);
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    registerCommand(context, constants_1.CONFIG, config_2.default);
    registerCommand(context, constants_1.LIST_DEFAULT, list_1.listCommand);
    registerCommand(context, constants_1.LIST_ALL, list_1.listAllCommand);
    registerCommand(context, constants_1.SYNC_TO_REMOTE, sync_1.sync2RemoteCommand);
    registerCommand(context, constants_1.SYNC_TO_LOCAL, sync_1.sync2LocalCommand);
    registerCommand(context, constants_1.UPLOAD, sync_1.uploadCommand);
    registerCommand(context, constants_1.DOWNLOAD, sync_1.downloadCommand);
    const workspaceFolders = host_1.getWorkspaceFolders();
    if (!workspaceFolders) {
        return;
    }
    output.status.msg('SFTP init...');
    setup()
        .then(_ => {
        output.status.msg('SFTP Ready', 1000 * 8);
    })
        .catch(output.onError);
}
exports.activate = activate;
function deactivate() {
    fileWatcher_1.clearAllWatcher();
    remoteFs_1.endAllRemote();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map