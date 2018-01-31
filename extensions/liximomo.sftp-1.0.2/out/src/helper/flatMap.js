"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flatMap(items, handle) {
    return items.reduce((result, item) => result.concat(handle(item)), []);
}
exports.default = flatMap;
//# sourceMappingURL=flatMap.js.map