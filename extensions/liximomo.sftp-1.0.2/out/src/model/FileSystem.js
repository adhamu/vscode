"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileType;
(function (FileType) {
    FileType[FileType["Directory"] = 1] = "Directory";
    FileType[FileType["File"] = 2] = "File";
    FileType[FileType["SymbolicLink"] = 3] = "SymbolicLink";
})(FileType = exports.FileType || (exports.FileType = {}));
;
class FileSystem {
    constructor(pathResolver) {
        this.defaultStreamOption = {};
        this.pathResolver = pathResolver;
    }
    getFileTypecharacter(stat) {
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
}
exports.default = FileSystem;
//# sourceMappingURL=FileSystem.js.map