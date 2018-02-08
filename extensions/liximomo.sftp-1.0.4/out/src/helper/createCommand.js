"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const output = require("../modules/output");
const config_1 = require("../modules/config");
const host_1 = require("../host");
function createCommand(cmdFn) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = host_1.getWorkspaceFolders();
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('The SFTP extension requires to work with an opened folder.');
            return;
        }
        try {
            yield cmdFn(...args);
        }
        catch (error) {
            output.onError(error);
        }
    });
}
exports.default = createCommand;
function createFileCommand(fileTask, getTarget) {
    const runTask = (target) => {
        const activityPath = target.fsPath;
        // todo swallow error from getConfig, so don't interrupt other target
        const config = config_1.getConfig(activityPath);
        fileTask(activityPath, config).catch(output.onError).then(host_1.refreshExplorer);
    };
    const cmdFn = (item) => __awaiter(this, void 0, void 0, function* () {
        const target = yield getTarget(item);
        if (!target) {
            return;
        }
        const pendingTasks = [].concat(target).map(runTask);
        return yield Promise.all(pendingTasks);
    });
    return createCommand(cmdFn);
}
exports.createFileCommand = createFileCommand;
//# sourceMappingURL=createCommand.js.map