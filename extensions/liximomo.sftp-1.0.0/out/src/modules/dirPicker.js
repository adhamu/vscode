"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const FileSystem_1 = require("../model/Fs/FileSystem");
const ROOT = '@root';
;
;
;
function showFiles(fileLookUp, isTop, parent, files, fs, option = {}) {
    let avalibleFiles = files.slice();
    let fileFilter;
    if (option.type !== undefined) {
        fileFilter = file => file.type === option.type;
    }
    if (option.filter !== undefined) {
        const preFilter = fileFilter ? fileFilter : a => true;
        fileFilter = file => preFilter(file) && option.filter(file);
    }
    if (fileFilter) {
        avalibleFiles = avalibleFiles.filter(fileFilter);
    }
    const isRoot = parent === ROOT;
    const items = avalibleFiles.map(file => ({
        value: file,
        label: file.fspath,
        description: '',
    }))
        .sort((l, r) => l.label.localeCompare(r.label));
    if (!isRoot) {
        const parentLookup = isTop(parent) ? ROOT : fs.pathResolver.resolve(parent, '..');
        items.unshift({
            value: {
                fspath: parentLookup,
                type: FileSystem_1.FileType.Directory,
            },
            label: '..',
            description: 'go back',
        });
        items.unshift({
            value: {
                fspath: parent,
                type: FileSystem_1.FileType.Directory,
            },
            label: '.',
            description: ' choose current foler',
        });
    }
    return vscode.window
        .showQuickPick(items, {
        ignoreFocusOut: true,
        placeHolder: 'Select a folder...(ESC to cancel)',
    })
        .then(result => {
        if (result === undefined) {
            return;
        }
        if (option.type === FileSystem_1.FileType.Directory) {
            if (result.label === '.') {
                return result.value;
            }
        }
        else {
            if (result.value.type === FileSystem_1.FileType.File) {
                return result.value;
            }
        }
        const targetPath = result.value.fspath;
        const nextItems = fileLookUp[targetPath];
        if (nextItems !== undefined) {
            return showFiles(fileLookUp, isTop, targetPath, nextItems, fs, option);
        }
        return fs.list(targetPath)
            .then(subFiles => {
            const subItems = subFiles.map(file => ({
                fspath: file.fspath,
                type: file.type,
            }));
            fileLookUp[targetPath] = subItems;
            return showFiles(fileLookUp, isTop, targetPath, subItems, fs, option);
        });
    });
}
function filePicker(baseFile, fs, option) {
    const filelookup = {
        [ROOT]: baseFile,
    };
    const isTop = file => baseFile.some(item => item.fspath === file);
    return showFiles(filelookup, isTop, ROOT, baseFile, fs, option);
}
exports.default = filePicker;
//# sourceMappingURL=dirPicker.js.map