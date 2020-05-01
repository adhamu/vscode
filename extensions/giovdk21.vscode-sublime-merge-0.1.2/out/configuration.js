'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configId = 'vscsm';
class Configuration {
    constructor() {
        this._showInStatusBarChangeEvent = new vscode_1.EventEmitter();
        this.onDidShowInStatusBarChange = this._showInStatusBarChangeEvent.event;
        this._watchForChanges();
    }
    get showInStatusBar() {
        return vscode_1.workspace.getConfiguration(configId).get('showInStatusBar') || false;
    }
    get debugEnabled() {
        return vscode_1.workspace.getConfiguration(configId).get('debug') || false;
    }
    _watchForChanges() {
        vscode_1.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(configId + '.showInStatusBar')) {
                this._showInStatusBarChangeEvent.fire(e);
            }
        });
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map