"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_1 = require("ssh2");
const fs = require("fs");
const RemoteClient_1 = require("./RemoteClient");
class SFTPClient extends RemoteClient_1.default {
    constructor(option) {
        super(option);
    }
    initClient() {
        return new ssh2_1.Client();
    }
    connect(readline) {
        const _a = this.getOption(), { interactiveAuth, password, privateKeyPath } = _a, option = __rest(_a, ["interactiveAuth", "password", "privateKeyPath"]);
        return new Promise((resolve, reject) => {
            const connectWithCredential = (passwd, privateKey) => this.client
                .on('ready', () => {
                this.client.sftp((err, sftp) => {
                    if (err) {
                        reject(err);
                    }
                    this.sftp = sftp;
                    resolve();
                });
            })
                .on('error', err => {
                reject(err);
            })
                .connect(Object.assign({ keepaliveInterval: 1000 * 30, keepaliveCountMax: 2 }, (interactiveAuth ? { readyTimeout: 99999999 } : {}), option, { privateKey, password: passwd, tryKeyboard: interactiveAuth }));
            if (interactiveAuth) {
                this.client.on('keyboard-interactive', function redo(name, instructions, instructionsLang, prompts, finish, stackedAnswers) {
                    const answers = stackedAnswers || [];
                    if (answers.length < prompts.length) {
                        readline(prompts[answers.length].prompt).then(answer => {
                            answers.push(answer);
                            redo(name, instructions, instructionsLang, prompts, finish, answers);
                        });
                    }
                    else {
                        finish(answers);
                    }
                });
            }
            if (!privateKeyPath) {
                connectWithCredential(password);
                return;
            }
            fs.readFile(privateKeyPath, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                connectWithCredential(password, data);
            });
        });
    }
    end() {
        return this.client.end();
    }
    getFsClient() {
        return this.sftp;
    }
}
exports.default = SFTPClient;
//# sourceMappingURL=SFTPClient.js.map