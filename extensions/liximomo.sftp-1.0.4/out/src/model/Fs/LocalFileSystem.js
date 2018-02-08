"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fse = require("fs-extra");
const FileSystem_1 = require("./FileSystem");
class LocalFileSystem extends FileSystem_1.default {
    constructor(pathResolver) {
        super(pathResolver);
    }
    lstat(path) {
        return new Promise((resolve, reject) => {
            fs.lstat(path, (err, stat) => {
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
                const stream = fs.createReadStream(path, option);
                resolve(stream);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    put(input, path, option) {
        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(path, option);
            stream.on('error', err => {
                reject(err);
            });
            stream.on('finish', _ => {
                resolve();
            });
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
            fs.readlink(path, (err, linkString) => {
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
            fs.symlink(targetPath, path, null, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    mkdir(dir) {
        return new Promise((resolve, reject) => {
            fs.mkdir(dir, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    ensureDir(dir) {
        return fse.ensureDir(dir);
    }
    toFileEntry(fullPath, stat) {
        return {
            fspath: fullPath,
            name: this.pathResolver.basename(fullPath),
            type: stat.type,
            size: stat.size,
            modifyTime: stat.mtime.getTime() / 1000,
            accessTime: stat.atime.getTime() / 1000,
        };
    }
    list(dir) {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                const fileStatus = files.map(file => {
                    const fspath = this.pathResolver.join(dir, file);
                    return this.lstat(fspath)
                        .then(stat => this.toFileEntry(fspath, stat));
                });
                resolve(Promise.all(fileStatus));
            });
        });
    }
    unlink(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    rmdir(path, recursive) {
        if (recursive) {
            return fse.remove(path);
        }
        return new Promise((resolve, reject) => {
            fs.rmdir(path, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
exports.default = LocalFileSystem;
//# sourceMappingURL=LocalFileSystem.js.map