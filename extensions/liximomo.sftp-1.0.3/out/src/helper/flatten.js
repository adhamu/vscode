"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flatten(items) {
    const accumulater = (result, item) => result.concat(item);
    return items.reduce(accumulater, []);
}
exports.default = flatten;
//# sourceMappingURL=flatten.js.map