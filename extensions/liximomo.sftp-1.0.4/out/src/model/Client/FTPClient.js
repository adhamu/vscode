"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Client = require("ftp");
const RemoteClient_1 = require("./RemoteClient");
class FTPClient extends RemoteClient_1.default {
    constructor(option) {
        super(option);
    }
    initClient() {
        return new Client();
    }
    connect() {
        const option = this.getOption();
        return new Promise((resolve, reject) => {
            this.client
                .on('ready', () => {
                if (option.passive) {
                    this.client._pasv(resolve);
                }
                else {
                    resolve();
                }
            })
                .on('error', err => {
                reject(err);
            })
                .connect(Object.assign({ keepalive: 1000 * 10 }, option, { user: option.username }));
        });
    }
    end() {
        return this.client.end();
    }
    getFsClient() {
        return this.client;
    }
}
exports.default = FTPClient;
//# sourceMappingURL=FTPClient.js.map