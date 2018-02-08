"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const fs = require("fs");
const output = require("../modules/output");
const permissionSpiltReg = /-/gi;
class SFTPClient {
    constructor(option) {
        this.client = new ssh2_1.Client();
        this.option = option;
    }
    setOption(option) {
        this.option = option;
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
            .on('error', () => {
            output.debug('connect error');
            cb();
        });
    }
    connect() {
        const { privateKeyPath } = this.option;
        return new Promise((resolve, reject) => {
            const connectWithKey = privateKey => this.client
                .on('ready', () => {
                this.client.sftp((err, sftp) => {
                    if (err) {
                        reject(err);
                    }
                    this.sftp = sftp;
                    resolve();
                });
            })
                .on('error', (err) => {
                reject(err);
            })
                .connect(Object.assign({ keepaliveInterval: 1000 * 60 * 5, keepaliveCountMax: 2 }, this.option, { privateKey }));
            if (!privateKeyPath) {
                connectWithKey(undefined);
            }
            else {
                fs.readFile(privateKeyPath, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    connectWithKey(data);
                });
            }
        });
    }
    end() {
        return this.client.end();
    }
}
exports.default = SFTPClient;
//# sourceMappingURL=SFTPClient.js.map