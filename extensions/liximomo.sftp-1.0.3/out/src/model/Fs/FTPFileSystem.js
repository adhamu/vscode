"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const output = require("../../modules/output");
const FileSystem_1 = require("./FileSystem");
const RemoteFileSystem_1 = require("./RemoteFileSystem");
const FTPClient_1 = require("../Client/FTPClient");
const numMap = {
    r: 4,
    w: 2,
    x: 1,
};
function toNumMode(rightObj) {
    // tslint:disable-next-line:no-shadowed-variable
    const modeStr = Object.keys(rightObj).reduce((modeStr, key) => {
        const rightStr = rightObj[key];
        let cur = 0;
        for (const char of rightStr) {
            cur += numMap[char];
        }
        return modeStr + cur;
    }, '');
    return parseInt(modeStr, 8);
}
class FTPFileSystem extends RemoteFileSystem_1.default {
    static getFileType(type) {
        if (type === 'd') {
            return FileSystem_1.FileType.Directory;
        }
        else if (type === '-') {
            return FileSystem_1.FileType.File;
        }
        else if (type === 'l') {
            return FileSystem_1.FileType.SymbolicLink;
        }
    }
    constructor(pathResolver, option) {
        super(pathResolver);
        this.setClient(new FTPClient_1.default(option));
    }
    get ftp() {
        return this.getClient().getFsClient();
    }
    // $caution windows will always get 0666
    lstat(path) {
        return new Promise((resolve, reject) => {
            this.ftp.list(this.pathResolver.dirname(path), (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                const fileStat = stats.map(stat => (Object.assign({}, stat, { type: FTPFileSystem.getFileType(stat.type), permissionMode: toNumMode(stat.rights) }))).find(ns => ns.name === this.pathResolver.basename(path));
                if (!fileStat) {
                    reject(new Error('file not exist'));
                    return;
                }
                resolve(fileStat);
            });
        });
    }
    get(path, option) {
        return new Promise((resolve, reject) => {
            this.ftp.get(path, (err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }
                ;
                if (!stream) {
                    reject(new Error('create ReadStream failed'));
                    return;
                }
                resolve(stream);
            });
        });
    }
    chmod(path, mode) {
        return new Promise((resolve, reject) => {
            const command = `CHMOD ${mode.toString(8)} ${path}`;
            this.ftp.site(command, err => {
                if (err) {
                    reject(err);
                    return;
                }
                ;
                resolve();
            });
        });
    }
    put(input, path, option) {
        return new Promise((resolve, reject) => {
            this.ftp.put(input, path, err => {
                if (err) {
                    reject(err);
                    return;
                }
                ;
                if (option && option.mode) {
                    this.chmod(path, option.mode)
                        .then(resolve)
                        .catch(error => {
                        // ignore error;
                        // $todo throw this error and ignore this error at up level.
                        output.error(`change ${path} mode to ${option.mode.toString(8)}`, error);
                        resolve();
                    });
                    return;
                }
                resolve();
            });
        });
    }
    readlink(path) {
        return this.lstat(path)
            .then(stat => stat.target);
    }
    symlink(targetPath, path) {
        // TO-DO implement
        return Promise.resolve();
    }
    mkdir(dir) {
        return new Promise((resolve, reject) => {
            this.ftp.mkdir(dir, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    ensureDir(dir) {
        return new Promise((resolve, reject) => {
            const tokens = dir.split('/');
            const root = tokens.shift();
            let dirPath = root === '' ? '/' : root;
            const mkdir = () => {
                let token = tokens.shift();
                if (!token && !tokens.length) {
                    resolve();
                    return;
                }
                token += '/';
                dirPath = this.pathResolver.join(dirPath, token);
                return this.mkdir(dirPath)
                    .then(mkdir, err => {
                    // if (err && err.message !== 'Cannot create a file when that file already exists.')
                    if (err.code === 550) {
                        // ignore already exist
                        mkdir();
                    }
                    else {
                        reject(err);
                    }
                });
            };
            mkdir();
        });
    }
    toFileEntry(fullPath, stat) {
        return {
            fspath: fullPath,
            type: FTPFileSystem.getFileType(stat.type),
            name: stat.name,
            size: stat.size,
            modifyTime: stat.date.getTime() / 1000,
            accessTime: stat.date.getTime() / 1000,
        };
    }
    list(dir, { showHiddenFiles = true } = {}) {
        return new Promise((resolve, reject) => {
            this.ftp.list(showHiddenFiles ? `-al ${dir}` : dir, (err, result = []) => {
                if (err) {
                    reject(err);
                    return;
                }
                const fileEntries = result.map(item => this.toFileEntry(this.pathResolver.join(dir, item.name), item));
                resolve(fileEntries);
            });
        });
    }
    unlink(path) {
        return new Promise((resolve, reject) => {
            this.ftp.delete(path, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    rmdir(path, recursive) {
        return new Promise((resolve, reject) => {
            this.ftp.rmdir(path, recursive, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
exports.default = FTPFileSystem;
//# sourceMappingURL=FTPFileSystem.js.map