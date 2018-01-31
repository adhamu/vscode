"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const fs = require("fs");
const permissionSpiltReg = /-/gi;
class SFTPClient {
    constructor(option) {
        this.client = new ssh2_1.Client();
        this.option = option;
    }
    connect() {
        const { privateKeyPath } = this.option;
        return new Promise((resolve, reject) => {
            fs.readFile(privateKeyPath, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                const privateKey = data;
                this.client
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
                    .connect(Object.assign({}, this.option, { privateKey }));
            });
        });
    }
    end() {
        return new Promise((resolve) => {
            resolve(this.client.end());
        });
    }
}
exports.default = SFTPClient;
//# sourceMappingURL=sftp-client.js.map