"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hashCode(str) {
    let hash = 5381;
    let i = str.length;
    while (i) {
        // tslint:disable-next-line no-bitwise
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    // Convert to positive
    // tslint:disable-next-line no-bitwise
    return hash >>> 0;
}
exports.default = hashCode;
//# sourceMappingURL=hash.js.map