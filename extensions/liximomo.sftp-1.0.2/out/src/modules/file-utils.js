"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function list(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            const fileStatus = files.map(file => {
                const fspath = path.join(dir, file);
                const status = fileStatus(fspath);
                return {
                    name: file,
                    fspath: fspath,
                    isDirectory: status.isDirectory(),
                };
            });
            resolve(Promise.all(fileStatus));
        });
    });
}
exports.list = list;
function fileStatus(file) {
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
exports.fileStatus = fileStatus;
//# sourceMappingURL=file-utils.js.map