"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isValidFile(uri) {
    return uri.scheme === 'file';
}
exports.isValidFile = isValidFile;
function isValidDocument(doc) {
    return isValidFile(doc.uri);
}
exports.isValidDocument = isValidDocument;
//# sourceMappingURL=documentFilter.js.map