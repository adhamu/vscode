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
const FileSystem_1 = require("../model/Fs/FileSystem");
const config_1 = require("../modules/config");
const path = require("path");
const ROOT = '@root';
function showFiles(fileLookUp, parent, files, option = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let avalibleFiles = files.slice();
        let filter;
        let fileFilter;
        if (option.type === FileSystem_1.FileType.Directory) {
            fileFilter = file => file.type === FileSystem_1.FileType.Directory;
        }
        else {
            // don't show SymbolicLink
            fileFilter = file => file.type !== FileSystem_1.FileType.SymbolicLink;
        }
        if (option.filter !== undefined) {
            filter = file => {
                return fileFilter(file) && option.filter(file);
            };
        }
        else {
            filter = fileFilter;
        }
        avalibleFiles = avalibleFiles.filter(filter);
        const items = avalibleFiles
            .map(file => ({
            value: file,
            label: file.name,
            description: file.description,
        }))
            .sort((l, r) => {
            if (l.value.type === r.value.type) {
                return l.label.localeCompare(r.label);
            }
            else if (l.value.type === FileSystem_1.FileType.Directory) {
                // dir goes to first
                return -1;
            }
            else {
                return 1;
            }
        });
        const result = yield vscode.window.showQuickPick(items, {
            ignoreFocusOut: true,
            placeHolder: 'Select a target...(ESC to cancel)',
        });
        if (result === undefined) {
            return;
        }
        // no limit or limit to dir, so we can choose current folder
        const allowChooseFolder = option.type === undefined || option.type === FileSystem_1.FileType.Directory;
        if (allowChooseFolder) {
            if (result.label === '.') {
                return result.value;
            }
        }
        // select a file
        if (result.value.type === FileSystem_1.FileType.File) {
            return result.value;
        }
        const selectedValue = result.value;
        const selectedPath = selectedValue.fsPath;
        // fs will be nerver be null if current is root, so get fs from picker item
        const fileSystem = yield selectedValue.getFs();
        const nextItems = fileLookUp[selectedPath];
        if (nextItems !== undefined) {
            return showFiles(fileLookUp, selectedValue, nextItems, option);
        }
        return fileSystem.list(selectedPath).then(subFiles => {
            const subItems = subFiles.map(file => ({
                name: path.basename(file.fspath) + (file.type === FileSystem_1.FileType.Directory ? '/' : ''),
                fsPath: file.fspath,
                parentFsPath: selectedPath,
                type: file.type,
                description: '',
                getFs: selectedValue.getFs,
            }));
            subItems.unshift({
                name: '..',
                fsPath: selectedValue.parentFsPath,
                parentFsPath: '#will never reach here, cause the dir has alreay be cached#',
                type: FileSystem_1.FileType.Directory,
                description: 'go back',
                getFs: selectedValue.getFs,
            });
            if (allowChooseFolder) {
                subItems.unshift({
                    name: '.',
                    fsPath: selectedPath,
                    parentFsPath: selectedValue.parentFsPath,
                    type: FileSystem_1.FileType.Directory,
                    description: ' choose current foler',
                    getFs: selectedValue.getFs,
                });
            }
            fileLookUp[selectedPath] = subItems;
            return showFiles(fileLookUp, selectedValue, subItems, option);
        });
    });
}
function listFiles(items, option) {
    const baseItems = items.map(item => ({
        name: path.basename(item.fsPath),
        fsPath: item.fsPath,
        parentFsPath: ROOT,
        type: FileSystem_1.FileType.Directory,
        description: item.fsPath,
        getFs: item.getFs,
    }));
    const fileLookUp = {
        [ROOT]: baseItems,
    };
    return showFiles(fileLookUp, null, baseItems, option);
}
exports.listFiles = listFiles;
function selectContext() {
    return new Promise((resolve, reject) => {
        const configs = config_1.getAllConfigs();
        const projectsList = configs
            .map(cfg => ({
            value: cfg.context,
            label: vscode.workspace.asRelativePath(cfg.context),
            description: '',
            detail: cfg.context,
        }))
            .sort((l, r) => l.label.localeCompare(r.label));
        vscode.window
            .showQuickPick(projectsList, {
            ignoreFocusOut: true,
            placeHolder: 'Select a folder...(ESC to cancel)',
        })
            .then(selection => {
            if (selection) {
                resolve(selection.value);
                return;
            }
            // cancel selection
            return null;
        }, reject);
    });
}
exports.selectContext = selectContext;
//# sourceMappingURL=select.js.map