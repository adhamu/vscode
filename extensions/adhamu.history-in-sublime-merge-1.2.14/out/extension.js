"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const child = require("child_process");
const findUp = require("find-up");
const path = require("path");
const getCurrentRepository = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = yield findUp('.git', {
        cwd: path.dirname(file),
        type: 'directory',
    });
    return path.dirname(repository !== null && repository !== void 0 ? repository : '');
});
const openSublimeMerge = (args, repository) => {
    child.execFile('smerge', args, {
        cwd: repository,
    });
};
const getFileDetails = (editor) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = yield getCurrentRepository(editor.document.uri.path);
    return {
        path: editor.document.uri.path.replace(`${repository}/`, ''),
        currentLineNumber: editor.selection.active.line + 1,
        repository: repository !== null && repository !== void 0 ? repository : '',
    };
});
const viewFileHistory = () => __awaiter(void 0, void 0, void 0, function* () {
    if (vscode.window.activeTextEditor) {
        const { path, repository } = yield getFileDetails(vscode.window.activeTextEditor);
        openSublimeMerge(['search', `file:"${path}"`], repository);
    }
});
const viewLineHistory = () => __awaiter(void 0, void 0, void 0, function* () {
    if (vscode.window.activeTextEditor) {
        const { path, repository, currentLineNumber } = yield getFileDetails(vscode.window.activeTextEditor);
        openSublimeMerge([
            'search',
            `file:"${path}" line:${currentLineNumber}-${currentLineNumber}`,
        ], repository);
    }
});
const blameFile = () => __awaiter(void 0, void 0, void 0, function* () {
    if (vscode.window.activeTextEditor) {
        const { path, repository } = yield getFileDetails(vscode.window.activeTextEditor);
        openSublimeMerge(['blame', path], repository);
    }
});
const activate = (context) => {
    const extensionName = 'history-in-sublime-merge';
    context.subscriptions.push(vscode.commands.registerCommand(`${extensionName}.viewFileHistory`, viewFileHistory));
    context.subscriptions.push(vscode.commands.registerCommand(`${extensionName}.viewLineHistory`, viewLineHistory));
    context.subscriptions.push(vscode.commands.registerCommand(`${extensionName}.blameFile`, blameFile));
};
exports.activate = activate;
const deactivate = () => { };
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map