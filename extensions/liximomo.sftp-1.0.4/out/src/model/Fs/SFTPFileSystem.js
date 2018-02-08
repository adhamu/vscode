"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileStatus = require("stat-mode");
const FileSystem_1 = require("./FileSystem");
const RemoteFileSystem_1 = require("./RemoteFileSystem");
const SFTPClient_1 = require("../Client/SFTPClient");
class SFTPFileSystem extends RemoteFileSystem_1.default {
    constructor(pathResolver, option) {
        super(pathResolver);
        this.setClient(new SFTPClient_1.default(option));
    }
    get sftp() {
        return this.getClient().getFsClient();
    }
    lstat(path) {
        return new Promise((resolve, reject) => {
            this.sftp.lstat(path, (err, stat) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(Object.assign({}, stat, { type: FileSystem_1.default.getFileTypecharacter(stat), permissionMode: stat.mode & parseInt('777', 8) }));
            });
        });
    }
    get(path, option) {
        return new Promise((resolve, reject) => {
            try {
                const stream = this.sftp.createReadStream(path, option);
                resolve(stream);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    put(input, path, option) {
        return new Promise((resolve, reject) => {
            const stream = this.sftp.createWriteStream(path, option);
            stream.on('error', reject);
            stream.on('finish', resolve);
            if (input instanceof Buffer) {
                stream.end(input);
                return;
            }
            input.on('error', reject);
            input.pipe(stream);
        });
    }
    readlink(path) {
        return new Promise((resolve, reject) => {
            this.sftp.readlink(path, (err, linkString) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(linkString);
            });
        });
    }
    symlink(targetPath, path) {
        return new Promise((resolve, reject) => {
            this.sftp.symlink(targetPath, path, err => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
    mkdir(dir) {
        return new Promise((resolve, reject) => {
            this.sftp.mkdir(dir, err => {
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
                    if (err.code === 4) {
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
    toFileEntry(fullPath, item) {
        const stat = new FileStatus(item.attrs);
        return {
            fspath: fullPath,
            type: FileSystem_1.default.getFileTypecharacter(stat),
            name: item.filename,
            size: item.attrs.size,
            modifyTime: item.attrs.mtime * 1000,
            accessTime: item.attrs.atime * 1000,
        };
    }
    list(dir, { showHiddenFiles = false } = {}) {
        return new Promise((resolve, reject) => {
            this.sftp.readdir(dir, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                const fileEntries = result.map(item => this.toFileEntry(this.pathResolver.join(dir, item.filename), item));
                resolve(fileEntries);
            });
        });
    }
    unlink(path) {
        return new Promise((resolve, reject) => {
            this.sftp.unlink(path, err => {
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
            if (!recursive) {
                this.sftp.rmdir(path, err => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
                return;
            }
            this.list(path)
                .then(fileEntries => {
                if (!fileEntries.length) {
                    this.rmdir(path, false)
                        .then(resolve, e => {
                        reject(e);
                    });
                    return;
                }
                const rmPromises = fileEntries.map(file => {
                    if (file.type === FileSystem_1.FileType.Directory) {
                        return this.rmdir(file.fspath, true);
                    }
                    return this.unlink(file.fspath);
                });
                Promise.all(rmPromises)
                    .then(() => this.rmdir(path, false))
                    .then(resolve, e => {
                    reject(e);
                });
            }, err => {
                reject(err);
            });
        });
    }
}
exports.default = SFTPFileSystem;
//# sourceMappingURL=SFTPFileSystem.js.map