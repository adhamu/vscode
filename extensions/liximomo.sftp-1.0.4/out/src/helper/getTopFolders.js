"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
/**
 * remove folder which is a child of other folders
 */
function getTopFolders(workspacsFolders) {
    const paths = workspacsFolders.map(folder => folder.uri.fsPath);
    return removeSubPath(paths);
}
exports.default = getTopFolders;
//# sourceMappingURL=getTopFolders.js.map