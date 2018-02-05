"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const editorConfig_1 = require("./editorConfig");
const constants_1 = require("../constants");
const config = editorConfig_1.getConfig();
const printDebugLog = config.printDebugLog;
class StatusBarItem {
    constructor(name) {
        this.hide = () => {
            this.statusBarItem.hide();
            this.isShow = false;
        };
        this.name = name;
        this.isShow = false;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    msg(text, varient) {
        if (!this.isShow) {
            this.statusBarItem.show();
            this.isShow = true;
        }
        this.statusBarItem.text = text;
        if (typeof varient === 'number') {
            setTimeout(this.hide, varient);
        }
        if (typeof varient === 'object' && typeof varient.then === 'function') {
            varient.then(this.hide, this.hide);
        }
    }
}
exports.status = new StatusBarItem('info');
function success(msg, event) {
    return vscode.window.showInformationMessage(`[${event || constants_1.EXTENSION_NAME}] ${msg}`);
}
exports.success = success;
function onError(err, event) {
    let errorString = err;
    if (err instanceof Error) {
        errorString = err.message;
        error(`context: ${event} reason: ${err.stack}`);
    }
    exports.status.msg('fail', 2000);
    return vscode.window.showErrorMessage(`[${event || constants_1.EXTENSION_NAME}] ${errorString}`);
}
exports.onError = onError;
let outputChannel;
function showOutPutChannel() {
    if (outputChannel !== undefined) {
        outputChannel.show();
    }
}
exports.showOutPutChannel = showOutPutChannel;
function print(...args) {
    if (outputChannel === undefined) {
        outputChannel = vscode.window.createOutputChannel(constants_1.EXTENSION_NAME);
    }
    const msg = args
        .map(arg => {
        if (arg instanceof Error) {
            return arg.stack;
        }
        else if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 4);
        }
        return arg;
    })
        .join(' ');
    outputChannel.appendLine(msg);
}
exports.print = print;
function info(...args) {
    print('[info]:', ...args);
}
exports.info = info;
function debug(...args) {
    if (!printDebugLog) {
        return;
    }
    print('[debug]:', ...args);
}
exports.debug = debug;
function error(...args) {
    print('[error]:', ...args);
}
exports.error = error;
//# sourceMappingURL=output.js.map