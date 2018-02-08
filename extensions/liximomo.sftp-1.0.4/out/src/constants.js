"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const VENDOR_FOLDER = '.vscode';
exports.EXTENSION_NAME = 'sftp';
exports.CONFIG = 'sftp.config.default';
exports.DEPRECATED_CONGIF_FILENAME = '.sftpConfig.json';
exports.CONGIF_FILENAME = 'sftp.json';
exports.CONFIG_PATH = path.join(VENDOR_FOLDER, exports.CONGIF_FILENAME);
exports.SYNC_TO_REMOTE = 'sftp.sync.remote';
exports.SYNC_TO_LOCAL = 'sftp.sync.local';
exports.UPLOAD = 'sftp.trans.remote';
exports.DOWNLOAD = 'sftp.trans.local';
exports.LIST_DEFAULT = 'sftp.list.default';
exports.LIST_ALL = 'sftp.list.all';
//# sourceMappingURL=constants.js.map