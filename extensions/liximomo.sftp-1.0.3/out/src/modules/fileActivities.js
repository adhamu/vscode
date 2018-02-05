"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documentFilter_1 = require("../helper/documentFilter");
const openFiles = {};
function traceFileActivities(vscode) {
    vscode.workspace.onDidOpenTextDocument((doc) => {
        if (!documentFilter_1.isValidDocument(doc)) {
            return;
        }
    });
    vscode.workspace.onDidCloseTextDocument((doc) => {
        if (!documentFilter_1.isValidDocument(doc)) {
            return;
        }
    });
}
exports.default = traceFileActivities;
function getOpenedTextDoucuments() {
    return Object.keys(openFiles).map(key => openFiles[key]);
}
exports.getOpenedTextDoucuments = getOpenedTextDoucuments;
//# sourceMappingURL=fileActivities.js.map