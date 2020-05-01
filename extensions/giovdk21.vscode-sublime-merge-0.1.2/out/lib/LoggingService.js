"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2017 Esben Petersen
 *  Licensed under the MIT License.
 *  See https://github.com/prettier/prettier-vscode/blob/master/LICENSE for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class LoggingService {
    constructor(config) {
        this._config = config;
        if (config.debugEnabled) {
            this.outputChannel = vscode_1.window.createOutputChannel('Sublime Merge for VSCode');
        }
    }
    /**
     * Append messages to the output channel and format it with a title
     *
     * @param message The message to append to the output channel
     */
    logInfo(message, data) {
        this.logMessage(message, 'INFO');
        if (data) {
            this.logObject(data);
        }
    }
    /**
     * Append messages to the output channel and format it with a title
     *
     * @param message The message to append to the output channel
     */
    logWarning(message, data) {
        this.logMessage(message, 'WARN');
        if (data) {
            this.logObject(data);
        }
    }
    logError(message, error) {
        this.logMessage(message, 'ERROR');
        if (!this._config.debugEnabled || !this.outputChannel) {
            return;
        }
        if (error instanceof Error) {
            if (error.message) {
                this.outputChannel.appendLine(error.message);
            }
            if (error.stack) {
                this.outputChannel.appendLine(error.stack);
            }
        }
        else if (error) {
            this.outputChannel.appendLine(error);
        }
    }
    show() {
        if (!this._config.debugEnabled || !this.outputChannel) {
            return;
        }
        this.outputChannel.show();
    }
    logObject(data) {
        if (this._config.debugEnabled && this.outputChannel) {
            const message = JSON.stringify(data, null, 2).trim();
            this.outputChannel.appendLine(message);
        }
    }
    /**
     * Append messages to the output channel and format it with a title
     *
     * @param message The message to append to the output channel
     */
    logMessage(message, logLevel) {
        if (this._config.debugEnabled && this.outputChannel) {
            const title = new Date().toLocaleTimeString();
            this.outputChannel.appendLine(`["${logLevel}" - ${title}] ${message}`);
        }
    }
}
exports.LoggingService = LoggingService;
//# sourceMappingURL=LoggingService.js.map