"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const sync_1 = require("../modules/sync");
const createCommand_1 = require("../helper/createCommand");
const select_1 = require("../helper/select");
const getActiveTarget = () => new Promise((resolve, reject) => {
    const active = vscode.window.activeTextEditor;
    if (!active || !active.document) {
        throw new Error('Action must have a file or directory as target!');
    }
    resolve({
        fsPath: active.document.fileName,
    });
});
const getTarget = item => {
    // command palette
    if (item === undefined) {
        return select_1.selectContext().then(path => ({ fsPath: path }));
    }
    // short cut
    if (!item.fsPath) {
        return getActiveTarget();
    }
    return Promise.resolve(item);
};
const getFolderTarget = item => {
    // context menu
    if (item && item.fsPath) {
        return Promise.resolve(item);
    }
    return select_1.selectContext().then(path => ({ fsPath: path }));
};
exports.sync2RemoteCommand = createCommand_1.createFileCommand(sync_1.sync2Remote, getFolderTarget);
exports.sync2LocalCommand = createCommand_1.createFileCommand(sync_1.sync2Local, getFolderTarget);
exports.uploadCommand = createCommand_1.createFileCommand(sync_1.upload, getTarget);
exports.downloadCommand = createCommand_1.createFileCommand(sync_1.download, getTarget);
//# sourceMappingURL=sync.js.map