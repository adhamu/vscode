"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const constants_1 = require("../constants");
const documentFilter_1 = require("../helper/documentFilter");
const throttle_1 = require("../helper/throttle");
const sync_1 = require("./sync");
const config_1 = require("./config");
const output = require("./output");
let workspaceWatcher;
const watchers = {};
const uploadQueue = [];
const deleteQueue = [];
const ACTION_INTEVAL = 500;
function isConfigFile(uri) {
    const filename = path.basename(uri.fsPath);
    return filename === constants_1.CONGIF_FILENAME;
}
function fileError(event, file, showErrorWindow = true) {
    return error => {
        output.error(`${event} ${file}`, '\n', error.stack);
        if (showErrorWindow) {
            output.showOutPutChannel();
        }
    };
}
function doUpload() {
    const files = uploadQueue
        .slice()
        .map(uri => uri.fsPath)
        .sort();
    uploadQueue.length = 0;
    files.forEach(file => {
        let config;
        try {
            config = config_1.getConfig(file);
        }
        catch (error) {
            output.onError(error);
            return;
        }
        sync_1.upload(file, config, true).catch(fileError('upload', file));
    });
}
function doDelete() {
    const files = deleteQueue
        .slice()
        .map(uri => uri.fsPath)
        .sort();
    deleteQueue.length = 0;
    let config;
    files.forEach(file => {
        try {
            config = config_1.getConfig(file);
        }
        catch (error) {
            output.onError(error);
            return;
        }
        sync_1.removeRemote(config.remotePath, Object.assign({}, config, { skipDir: true }), true).catch(fileError('delete', config.remotePath, false));
    });
}
const throttledUpload = throttle_1.default(doUpload, ACTION_INTEVAL);
const throttledDelete = throttle_1.default(doDelete, ACTION_INTEVAL);
function uploadHandler(uri) {
    if (!documentFilter_1.isValidFile(uri)) {
        return;
    }
    uploadQueue.push(uri);
    throttledUpload();
}
function getWatcherByConfig(config) {
    return watchers[config.context];
}
function removeWatcherByConfig(config) {
    return delete watchers[config.context];
}
function getWatchs() {
    return Object.keys(watchers).map(key => watchers[key]);
}
function setUpWatcher(config) {
    const watchConfig = config.watcher !== undefined ? config.watcher : {};
    let watcher = getWatcherByConfig(config);
    if (watcher) {
        // clear old watcher
        watcher.dispose();
    }
    const shouldAddListenser = watchConfig.autoUpload || watchConfig.autoDelete;
    // tslint:disable-next-line triple-equals
    if (watchConfig.files == false || !shouldAddListenser) {
        return;
    }
    watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(config.context, watchConfig.files), false, false, false);
    watchers[config.context] = watcher;
    if (watchConfig.autoUpload) {
        watcher.onDidCreate(uploadHandler);
        watcher.onDidChange(uploadHandler);
    }
    if (watchConfig.autoDelete) {
        watcher.onDidDelete(uri => {
            if (!documentFilter_1.isValidFile(uri)) {
                return;
            }
            deleteQueue.push(uri);
            throttledDelete();
        });
    }
}
function disableWatcher(config) {
    const watcher = getWatcherByConfig(config);
    if (watcher) {
        watcher.dispose();
        removeWatcherByConfig(config);
    }
}
exports.disableWatcher = disableWatcher;
function enableWatcher(config) {
    if (getWatcherByConfig(config) !== undefined) {
        return;
    }
    setUpWatcher(config);
}
exports.enableWatcher = enableWatcher;
function watchWorkspace({ onDidSaveFile, onDidSaveSftpConfig, }) {
    if (workspaceWatcher) {
        workspaceWatcher.dispose();
    }
    workspaceWatcher = vscode.workspace.onDidSaveTextDocument((doc) => {
        const uri = doc.uri;
        if (!documentFilter_1.isValidFile(uri)) {
            return;
        }
        // let configWatcher do this
        if (isConfigFile(uri)) {
            onDidSaveSftpConfig(uri);
            return;
        }
        onDidSaveFile(uri);
    });
}
exports.watchWorkspace = watchWorkspace;
function watchFiles(config) {
    const configs = [].concat(config);
    configs.forEach(setUpWatcher);
}
exports.watchFiles = watchFiles;
function clearAllWatcher() {
    const disposable = vscode.Disposable.from(...getWatchs(), workspaceWatcher);
    disposable.dispose();
}
exports.clearAllWatcher = clearAllWatcher;
//# sourceMappingURL=fileWatcher.js.map