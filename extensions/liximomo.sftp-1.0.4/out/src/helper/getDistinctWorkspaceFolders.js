"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function isSubPath(source, target) {
    return source.startsWith(target);
}
function removeSubPath(paths) {
    const result = [];
    const sortedPaths = paths.sort((a, b) => b.length - a.length);
    for (let curIndex = 0; curIndex < sortedPaths.length; curIndex++) {
        const curPath = sortedPaths[curIndex];
        let isSub = false;
        for (let targetIndex = curIndex + 1; targetIndex < sortedPaths.length; targetIndex++) {
            const targetPath = sortedPaths[targetIndex];
            if (isSubPath(curPath, targetPath)) {
                isSub = true;
                break;
            }
        }
        if (!isSub) {
            result.push(curPath);
        }
    }
    return result;
}
function getDistinctWorkspaceFolders() {
    const rootPaths = vscode.workspace.workspaceFolders.map(folder => folder.uri.fsPath);
    return removeSubPath(rootPaths);
}
exports.default = getDistinctWorkspaceFolders;
//# sourceMappingURL=getDistinctWorkspaceFolders.js.map