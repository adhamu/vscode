"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileType;
(function (FileType) {
    FileType[FileType["Directory"] = 1] = "Directory";
    FileType[FileType["File"] = 2] = "File";
    FileType[FileType["SymbolicLink"] = 3] = "SymbolicLink";
})(FileType = exports.FileType || (exports.FileType = {}));
;
;
;
;
class FileSystem {
    static getFileTypecharacter(stat) {
        if (stat.isDirectory()) {
            return FileType.Directory;
        }
        else if (stat.isFile()) {
            return FileType.File;
        }
        else if (stat.isSymbolicLink()) {
            return FileType.SymbolicLink;
        }
    }
    constructor(pathResolver) {
        this.pathResolver = pathResolver;
    }
}
exports.default = FileSystem;
//# sourceMappingURL=FileSystem.js.map