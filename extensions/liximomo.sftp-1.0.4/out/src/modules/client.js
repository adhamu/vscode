"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const output = require("../modules/output");
const SFTPClient_1 = require("../model/SFTPClient");
let needReconect = true;
const client = new SFTPClient_1.default();
client.onDisconnected(invalidClient);
// prevent concurrent connecting;
let pendingPromise = null;
function getClient(option) {
    if (!needReconect) {
        pendingPromise = null;
        return Promise.resolve(client);
    }
    if (!pendingPromise) {
        client.setOption(option);
        output.status.msg('connecting...');
        pendingPromise = client.connect()
            .then(() => {
            needReconect = false;
            return client;
        }, err => {
            invalidClient();
            throw err;
        });
    }
    return pendingPromise;
}
exports.default = getClient;
function invalidClient() {
    needReconect = true;
}
exports.invalidClient = invalidClient;
function endClient() {
    client.end();
    invalidClient();
}
exports.endClient = endClient;
//# sourceMappingURL=client.js.map