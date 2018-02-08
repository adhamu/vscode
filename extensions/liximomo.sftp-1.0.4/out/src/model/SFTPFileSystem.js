"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileStatus = require("stat-mode");
const FileSystem_1 = require("./FileSystem");
class SFTPFileSystem extends FileSystem_1.default {
    constructor(pathResolver, sftpClient) {
        super(pathResolver);
        this.sftp = sftpClient;
    }
    lstat(path) {
        return new Promise((resolve, reject) => {
            this.sftp.lstat(path, (err, stat) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(Object.assign({}, stat, { type: this.getFileTypecharacter(stat) }));
            });
        });
    }
    get(path, option = this.defaultStreamOption) {
        return new Promise((resolve, reject) => {
            try {
                const stream = this.sftp.createReadStream(path, option);
                stream.on('error', reject);
                resolve(stream);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    put(input, path, option = this.defaultStreamOption) {
        return new Promise((resolve, reject) => {
            const stream = this.sftp.createWriteStream(path, option);
            stream.on('error', reject);
            stream.on('close', resolve);
            if (input instanceof Buffer) {
                stream.end(input);
                return;
            }
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
                if (err && err.code !== 4) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    mkdir(dir) {
        return new Promise((resolve, reject) => {
            this.sftp.mkdir(dir, err => {
                if (err && err.code !== 4) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    ensureDir(dir) {
        let dirWithoutRoot = dir.slice(1);
        return new Promise((resolve, reject) => {
            const tokens = dirWithoutRoot.split(this.pathResolver.sep);
            let dirPath = '/';
            const mkdir = () => {
                let token = tokens.shift();
                if (!token && !tokens.length) {
                    resolve();
                    return;
                }
                token += '/';
                dirPath = this.pathResolver.join(dirPath, token);
                return this.mkdir(dirPath)
                    .then(mkdir);
            };
            return mkdir();
        });
    }
    toFileEntry(fullPath, item) {
        const stat = new FileStatus(item.attrs);
        return {
            fspath: fullPath,
            type: this.getFileTypecharacter(stat),
            name: item.filename,
            size: item.attrs.size,
            modifyTime: item.attrs.mtime * 1000,
            accessTime: item.attrs.atime * 1000,
        };
    }
    list(dir) {
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
                return this.sftp.rmdir(path, err => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            }
            return this.list(path).then(fileEntries => {
                if (!fileEntries.length) {
                    return this.rmdir(path, false);
                }
                const rmPromises = fileEntries.map(file => {
                    if (file.type === FileSystem_1.FileType.Directory) {
                        return this.rmdir(file.fspath, true);
                    }
                    return this.unlink(file.fspath);
                });
                return Promise.all(rmPromises).then(() => this.rmdir(path, false));
            });
        });
    }
}
exports.default = SFTPFileSystem;
//# sourceMappingURL=SFTPFileSystem.js.map