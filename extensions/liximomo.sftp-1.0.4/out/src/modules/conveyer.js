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
const concatLimit = require("async/concatLimit");
const output = require("../modules/output");
const FileSystem_1 = require("../model/Fs/FileSystem");
const upath_1 = require("../modules/upath");
const flatten_1 = require("../helper/flatten");
const defaultTransportOption = {
    concurrency: 512,
    ignore: [],
    perserveTargetMode: false,
};
const defaultSyncOption = {
    concurrency: 512,
    ignore: [],
    perserveTargetMode: false,
    model: 'update',
};
function fileDepth(file) {
    return upath_1.default.normalize(file).split('/').length;
}
function fileName2Show(filePath) {
    return vscode.workspace.asRelativePath(filePath);
}
function shouldSkip(path, ignore) {
    if (ignore) {
        return ignore(path);
    }
    return false;
}
const toHash = (items, key, transform) => items.reduce((hash, item) => {
    let transformedItem = item;
    if (transform) {
        transformedItem = transform(item);
    }
    hash[transformedItem[key]] = transformedItem;
    return hash;
}, {});
function getFileMode(path, fs) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stat = yield fs.lstat(path);
            return stat.permissionMode;
        }
        catch (error) {
            output.debug(`try to get ${path} mode fail, default to 0666`);
            return 0o666;
        }
    });
}
function taskBatchProcess(queue, { concurrency }) {
    return __awaiter(this, void 0, void 0, function* () {
        queue.sort((a, b) => fileDepth(b.file) - fileDepth(a.file));
        return new Promise((resolve, reject) => {
            concatLimit(queue, concurrency, (task, callback) => {
                // the task will never throw, so don't need catch;
                // $todo extract error handle to top level
                Promise.resolve(task.call()).then(r => callback(null, r));
            }, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        });
    });
}
function transportFile(src, des, srcFs, desFs, option) {
    if (shouldSkip(src, option.ignore)) {
        return Promise.resolve({
            target: src,
            ignored: true,
        });
    }
    output.status.msg(`transfer ${fileName2Show(src)}`);
    const transPromise = option.perserveTargetMode
        ?
            Promise.all([srcFs.get(src), getFileMode(des, desFs)]).then(([inputStream, mode]) => desFs.put(inputStream, des, { mode }))
        : srcFs.get(src).then(inputStream => desFs.put(inputStream, des));
    return transPromise
        .then(() => ({
        target: src,
        op: 'transmission file',
    }))
        .catch(err => ({
        target: src,
        error: true,
        op: 'transmission file',
        payload: err,
    }));
}
function transportSymlink(src, des, srcFs, desFs, option) {
    if (shouldSkip(src, option.ignore)) {
        return Promise.resolve({
            target: src,
            ignored: true,
        });
    }
    output.status.msg(`transfer ${fileName2Show(src)}`);
    return srcFs
        .readlink(src)
        .then(targetPath => {
        return desFs.symlink(targetPath, des).catch(err => {
            // ignore file already exist
            if (err.code === 4 || err.code === 'EEXIST') {
                return;
            }
            throw err;
        });
    })
        .then(() => ({
        target: src,
        op: 'transmission Symlink',
    }))
        .catch(err => ({
        target: src,
        error: true,
        op: 'transmission Symlink',
        payload: err,
    }));
}
function removeFile(path, fs, option) {
    if (shouldSkip(path, option.ignore)) {
        return Promise.resolve({
            target: path,
            ignored: true,
        });
    }
    output.status.msg(`remove ${fileName2Show(path)}`);
    return fs
        .unlink(path)
        .then(() => ({
        target: path,
        op: 'remove file',
    }))
        .catch(err => ({
        target: path,
        error: true,
        op: 'remove file',
        payload: err,
    }));
}
function removeDir(path, fs, option) {
    if (shouldSkip(path, option.ignore)) {
        return Promise.resolve({
            target: path,
            ignored: true,
        });
    }
    output.status.msg(`remove dir ${fileName2Show(path)}`);
    return fs
        .rmdir(path, true)
        .then(() => ({
        target: path,
        op: 'remove dir',
    }))
        .catch(err => ({
        target: path,
        error: true,
        op: 'remove dir',
        payload: err,
    }));
}
function _transportDir(src, des, srcFs, desFs, option) {
    if (shouldSkip(src, option.ignore)) {
        return Promise.resolve([
            {
                file: src,
                call: () => Promise.resolve([
                    {
                        target: src,
                        ignored: true,
                    },
                ]),
            },
        ]);
    }
    const listFiles = () => {
        output.status.msg(`retrieving directory ${fileName2Show(src)}`);
        return srcFs.list(src);
    };
    const createUploadTask = (item) => {
        if (item.type === FileSystem_1.FileType.Directory) {
            return _transportDir(item.fspath, desFs.pathResolver.join(des, item.name), srcFs, desFs, option);
        }
        const task = {
            file: item.fspath,
            call: undefined,
        };
        if (item.type === FileSystem_1.FileType.SymbolicLink) {
            task.call = () => transportSymlink(item.fspath, desFs.pathResolver.join(des, item.name), srcFs, desFs, option);
        }
        else if (item.type === FileSystem_1.FileType.File) {
            task.call = () => transportFile(item.fspath, desFs.pathResolver.join(des, item.name), srcFs, desFs, option);
        }
        else {
            task.call = () => ({
                target: item.fspath,
                error: true,
                op: 'transmission',
                payload: new Error('unsupport file type'),
            });
        }
        return task;
    };
    return desFs
        .ensureDir(des)
        .then(listFiles)
        .then(items => items.map(createUploadTask))
        .then(tasks => Promise.all(tasks))
        .then(result => flatten_1.default(result));
}
function _sync(srcDir, desDir, srcFs, desFs, option) {
    if (shouldSkip(srcDir, option.ignore)) {
        return Promise.resolve([
            {
                file: srcDir,
                call: () => Promise.resolve([
                    {
                        target: srcDir,
                        ignored: true,
                    },
                ]),
            },
        ]);
    }
    output.status.msg(`collect files ${fileName2Show(srcDir)}...`);
    const syncFiles = ([srcFileEntries, desFileEntries]) => {
        output.status.msg('diff files...');
        const srcFileTable = toHash(srcFileEntries, 'id', fileEntry => (Object.assign({}, fileEntry, { id: upath_1.default.normalize(srcFs.pathResolver.relative(srcDir, fileEntry.fspath)) })));
        const desFileTable = toHash(desFileEntries, 'id', fileEntry => (Object.assign({}, fileEntry, { id: upath_1.default.normalize(desFs.pathResolver.relative(desDir, fileEntry.fspath)) })));
        const file2trans = [];
        const symlink2trans = [];
        const dir2trans = [];
        const dir2sync = [];
        const fileMissed = [];
        const dirMissed = [];
        Object.keys(srcFileTable).forEach(id => {
            const srcFile = srcFileTable[id];
            const file = desFileTable[id];
            switch (srcFile.type) {
                case FileSystem_1.FileType.Directory:
                    if (file) {
                        dir2sync.push([srcFile, file]);
                        // delete process file
                        delete desFileTable[id];
                    }
                    else if (option.model === 'full') {
                        dir2trans.push([srcFile, { fspath: desFs.pathResolver.join(desDir, srcFile.name) }]);
                    }
                    break;
                case FileSystem_1.FileType.File:
                    if (file) {
                        file2trans.push([srcFile, file]);
                        // delete process file
                        delete desFileTable[id];
                    }
                    else if (option.model === 'full') {
                        file2trans.push([srcFile, { fspath: desFs.pathResolver.join(desDir, srcFile.name) }]);
                    }
                    break;
                case FileSystem_1.FileType.SymbolicLink:
                    if (file) {
                        symlink2trans.push([srcFile, file]);
                        // delete process file
                        delete desFileTable[id];
                    }
                    else if (option.model === 'full') {
                        symlink2trans.push([
                            srcFile,
                            { fspath: desFs.pathResolver.join(desDir, srcFile.name) },
                        ]);
                    }
                    break;
                default:
            }
        });
        if (option.model === 'full') {
            Object.keys(desFileTable).forEach(id => {
                const file = desFileTable[id];
                switch (file.type) {
                    case FileSystem_1.FileType.Directory:
                        dirMissed.push(file);
                        break;
                    case FileSystem_1.FileType.File:
                    case FileSystem_1.FileType.SymbolicLink:
                        fileMissed.push(file);
                        break;
                    default:
                }
            });
        }
        const transFileTasks = file2trans.map(([srcfile, desFile]) => ({
            file: srcfile.fspath,
            call: () => transportFile(srcfile.fspath, desFile.fspath, srcFs, desFs, option),
        }));
        const transSymlinkTasks = symlink2trans.map(([srcfile, desFile]) => ({
            file: srcfile.fspath,
            call: () => transportSymlink(srcfile.fspath, desFile.fspath, srcFs, desFs, option),
        }));
        const transDirTasks = dir2trans.map(([srcfile, desFile]) => _transportDir(srcfile.fspath, desFile.fspath, srcFs, desFs, option));
        const syncDirTasks = dir2sync.map(([srcfile, desFile]) => _sync(srcfile.fspath, desFile.fspath, srcFs, desFs, option));
        const clearFileTasks = fileMissed.map(file => ({
            file: file.fspath,
            call: () => removeFile(file.fspath, desFs, option),
        }));
        const clearDirTasks = dirMissed.map(file => ({
            file: file.fspath,
            call: () => removeDir(file.fspath, desFs, option),
        }));
        return Promise.all([
            ...syncDirTasks,
            ...transFileTasks,
            ...transSymlinkTasks,
            ...transDirTasks,
            ...clearFileTasks,
            ...clearDirTasks,
        ]).then(flatten_1.default);
    };
    return Promise.all([
        srcFs.list(srcDir).catch(err => []),
        desFs.list(desDir).catch(err => []),
    ]).then(syncFiles);
}
exports._sync = _sync;
function transportDir(src, des, srcFs, desFs, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const fullOption = Object.assign({}, defaultSyncOption, option);
        let result;
        try {
            const tasks = yield _transportDir(src, des, srcFs, desFs, fullOption);
            result = yield taskBatchProcess(tasks, { concurrency: fullOption.concurrency });
        }
        catch (err) {
            result = [
                {
                    target: src,
                    error: true,
                    op: 'transmission dir',
                    payload: err,
                },
            ];
        }
        return result;
    });
}
function sync(srcDir, desDir, srcFs, desFs, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const fullOption = Object.assign({}, defaultSyncOption, option);
        let result;
        try {
            const tasks = yield _sync(srcDir, desDir, srcFs, desFs, fullOption);
            result = yield taskBatchProcess(tasks, { concurrency: fullOption.concurrency });
        }
        catch (err) {
            result = [
                {
                    target: srcDir,
                    error: true,
                    op: 'sync',
                    payload: err,
                },
            ];
        }
        return result;
    });
}
exports.sync = sync;
function transport(src, des, srcFs, desFs, option) {
    const fullOption = Object.assign({}, defaultTransportOption, option);
    if (shouldSkip(src, fullOption.ignore)) {
        return Promise.resolve([
            {
                target: src,
                ignored: true,
            },
        ]);
    }
    return srcFs.lstat(src).then(stat => {
        let result;
        if (stat.type === FileSystem_1.FileType.Directory) {
            result = transportDir(src, des, srcFs, desFs, fullOption);
        }
        else if (stat.type === FileSystem_1.FileType.File) {
            result = desFs
                .ensureDir(desFs.pathResolver.dirname(des))
                .then(() => transportFile(src, des, srcFs, desFs, fullOption));
        }
        else if (stat.type === FileSystem_1.FileType.SymbolicLink) {
            result = desFs
                .ensureDir(desFs.pathResolver.dirname(des))
                .then(() => transportSymlink(src, des, srcFs, desFs, fullOption));
        }
        return result;
    }, err => {
        return [
            {
                target: src,
                error: true,
                op: 'transport',
                payload: err,
            },
        ];
    });
}
exports.transport = transport;
function remove(path, fs, option) {
    if (shouldSkip(path, option.ignore)) {
        return Promise.resolve({
            target: path,
            ignored: true,
        });
    }
    return fs.lstat(path).then(stat => {
        let result;
        switch (stat.type) {
            case FileSystem_1.FileType.Directory:
                if (!option.skipDir) {
                    result = removeDir(path, fs, option);
                }
                break;
            case FileSystem_1.FileType.File:
            case FileSystem_1.FileType.SymbolicLink:
                result = removeFile(path, fs, option);
                break;
            default:
                result = [
                    {
                        target: path,
                        error: true,
                        op: 'remove',
                        payload: new Error('unsupport file type'),
                    },
                ];
        }
        return result;
    }, err => {
        return [
            {
                target: path,
                error: true,
                op: 'remove',
                payload: err,
            },
        ];
    });
}
exports.remove = remove;
//# sourceMappingURL=conveyer.js.map