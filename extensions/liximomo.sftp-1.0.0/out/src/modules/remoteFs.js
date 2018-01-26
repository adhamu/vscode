"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const upath_1 = require("./upath");
const output = require("../modules/output");
const LocalFileSystem_1 = require("../model/Fs/LocalFileSystem");
const SFTPFileSystem_1 = require("../model/Fs/SFTPFileSystem");
const FTPFileSystem_1 = require("../model/Fs/FTPFileSystem");
function hashOption(opiton) {
    return Object.keys(opiton).map(key => opiton[key]).join('');
}
class KeepAliveRemoteFs {
    constructor() {
        this.isValid = false;
    }
    getFs(option) {
        if (this.isValid && this.option === option) {
            this.pendingPromise = null;
            return Promise.resolve(this.fs);
        }
        if (!this.pendingPromise) {
            output.debug('connect to remote');
            if (option.protocol === 'sftp') {
                const willFullCiphers = Object.assign({ algorithms: {
                        cipher: [
                            'aes128-ctr',
                            'aes192-ctr',
                            'aes256-ctr',
                            'aes128-gcm',
                            'aes128-gcm@openssh.com',
                            'aes256-gcm',
                            'aes256-gcm@openssh.com',
                            'aes256-cbc',
                            'aes192-cbc',
                            'aes128-cbc',
                            'blowfish-cbc',
                            '3des-cbc',
                            'arcfour256',
                            'arcfour128',
                            'cast128-cbc',
                            'arcfour',
                        ],
                    } }, option);
                this.fs = new SFTPFileSystem_1.default(upath_1.default, willFullCiphers);
            }
            else if (option.protocol === 'ftp') {
                this.fs = new FTPFileSystem_1.default(upath_1.default, option);
            }
            else {
                return Promise.reject(new Error(`unsupported protocol ${option.protocol}`));
            }
            const client = this.fs.getClient();
            client.onDisconnected(this.invalid.bind(this));
            output.status.msg('connecting...');
            this.pendingPromise = client.connect(prompt => {
                // tslint:disable-next-line prefer-const
                let password = true;
                // if (/password/i.test(prompt)) {
                //   password = true;
                // }
                return vscode.window.showInputBox({
                    ignoreFocusOut: true,
                    password,
                    prompt,
                });
            })
                .then(() => {
                this.isValid = true;
                return this.fs;
            }, err => {
                this.invalid();
                throw err;
            });
        }
        return this.pendingPromise;
    }
    invalid() {
        this.pendingPromise = null;
        this.isValid = false;
    }
    end() {
        this.invalid();
        this.fs.getClient().end();
    }
}
let testFs;
function getTestFs() {
    if (!testFs) {
        testFs = new LocalFileSystem_1.default(path);
    }
    return Promise.resolve(testFs);
}
const fsTable = {};
function getFileSystem(option) {
    if (option.protocol === 'test') {
        return getTestFs();
    }
    const identity = hashOption(option);
    const fs = fsTable[identity];
    if (fs !== undefined) {
        return fs.getFs(option);
    }
    const fsInstance = new KeepAliveRemoteFs();
    fsTable[identity] = fsInstance;
    return fsInstance.getFs(option);
}
exports.default = getFileSystem;
// TODO
function endAllRemote() {
    Object.keys(fsTable).forEach(key => {
        const fs = fsTable[key];
        fs.end();
    });
}
exports.endAllRemote = endAllRemote;
//# sourceMappingURL=remoteFs.js.map