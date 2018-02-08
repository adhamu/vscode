"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isValidDocument(doc) {
    return doc.uri.scheme === 'file';
}
exports.default = isValidDocument;
function isValidFile(uri) {
    return uri.scheme === 'file';
}
exports.isValidFile = isValidFile;
//# sourceMappingURL=isValidDocument.js.map