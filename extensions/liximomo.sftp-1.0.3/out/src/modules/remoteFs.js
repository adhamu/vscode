"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const host_1 = require("../host");
const upath_1 = require("./upath");
const output = require("../modules/output");
const LocalFileSystem_1 = require("../model/Fs/LocalFileSystem");
const SFTPFileSystem_1 = require("../model/Fs/SFTPFileSystem");
const FTPFileSystem_1 = require("../model/Fs/FTPFileSystem");
function hashOption(opiton) {
    return Object.keys(opiton)
        .map(key => opiton[key])
        .join('');
}
class KeepAliveRemoteFs {
    constructor() {
        this.isValid = false;
    }
    getFs(option) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isValid) {
                this.pendingPromise = null;
                return Promise.resolve(this.fs);
            }
            if (!this.pendingPromise) {
                output.debug('connect to remote');
                // $todo implement promptForPass
                let shouldPromptForPass = false;
                let connectOption;
                let FsConstructor;
                if (option.protocol === 'sftp') {
                    connectOption = Object.assign({ algorithms: {
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
                        } }, {
                        host: option.host,
                        port: option.port,
                        username: option.username,
                        password: option.password,
                        agent: option.agent,
                        privateKeyPath: option.privateKeyPath,
                        passphrase: option.passphrase,
                        interactiveAuth: option.interactiveAuth,
                    });
                    // tslint:disable triple-equals
                    shouldPromptForPass =
                        connectOption.password == undefined &&
                            connectOption.agent == undefined &&
                            connectOption.privateKeyPath == undefined;
                    // tslint:enable
                    // explict compare to true, cause we want to distinct between string and true
                    if (option.passphrase === true) {
                        connectOption.passphrase = yield host_1.promptForPassword('Enter your passphrase');
                    }
                    FsConstructor = SFTPFileSystem_1.default;
                }
                else if (option.protocol === 'ftp') {
                    connectOption = {
                        host: option.host,
                        port: option.port,
                        username: option.username,
                        password: option.password,
                        secure: option.secure,
                        secureOptions: option.secureOptions,
                        passive: option.passive,
                    };
                    // tslint:disable-next-line triple-equals
                    shouldPromptForPass = connectOption.password == undefined;
                    FsConstructor = FTPFileSystem_1.default;
                }
                else {
                    return Promise.reject(new Error(`unsupported protocol ${option.protocol}`));
                }
                if (shouldPromptForPass) {
                    connectOption.password = yield host_1.promptForPassword('Enter your password');
                }
                this.fs = new FsConstructor(upath_1.default, connectOption);
                const client = this.fs.getClient();
                client.onDisconnected(this.invalid.bind(this));
                output.status.msg('connecting...');
                this.pendingPromise = client.connect(host_1.promptForPassword).then(() => {
                    this.isValid = true;
                    return this.fs;
                }, err => {
                    this.invalid();
                    throw err;
                });
            }
            return this.pendingPromise;
        });
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
function endAllRemote() {
    Object.keys(fsTable).forEach(key => {
        const fs = fsTable[key];
        fs.end();
        delete fsTable[key];
    });
}
exports.endAllRemote = endAllRemote;
//# sourceMappingURL=remoteFs.js.map