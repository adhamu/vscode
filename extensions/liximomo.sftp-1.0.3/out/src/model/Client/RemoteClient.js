"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const output = require("../../modules/output");
;
class RemoteClient {
    constructor(option) {
        this.option = option;
        this.client = this.initClient();
    }
    onDisconnected(cb) {
        this.client
            .on('end', () => {
            output.debug('connect end');
            cb();
        })
            .on('close', () => {
            output.debug('connect close');
            cb();
        })
            .on('error', err => {
            output.debug('remote error', err);
            cb();
        });
    }
    setOption(option) {
        this.option = option;
    }
    getOption() {
        return this.option;
    }
}
exports.default = RemoteClient;
//# sourceMappingURL=RemoteClient.js.map