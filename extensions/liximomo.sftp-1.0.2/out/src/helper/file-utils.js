"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function fileStat(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stat) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stat);
        });
    });
}
exports.fileStat = fileStat;
function list(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            const fileStatus = files.map(file => {
                const fspath = path.join(dir, file);
                return fileStat(fspath)
                    .then(stat => ({
                    name: file,
                    fspath: fspath,
                    isDirectory: stat.isDirectory(),
                }));
            });
            resolve(Promise.all(fileStatus));
        });
    });
}
exports.list = list;
//# sourceMappingURL=file-utils.js.map