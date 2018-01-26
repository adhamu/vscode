"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem_1 = require("./FileSystem");
class RemoteFileSystem extends FileSystem_1.default {
    constructor(pathResolver) {
        super(pathResolver);
    }
    getClient() {
        if (!this.client) {
            throw new Error('client not found!');
        }
        return this.client;
    }
    setClient(client) {
        this.client = client;
    }
}
exports.default = RemoteFileSystem;
//# sourceMappingURL=RemoteFileSystem.js.map