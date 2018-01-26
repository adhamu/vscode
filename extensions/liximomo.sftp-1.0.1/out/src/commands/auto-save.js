"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../modules/config");
const sync_1 = require("../modules/sync");
const output = require("../modules/output");
function autoSave(uri) {
    const activityPath = uri.fsPath;
    let config;
    try {
        config = config_1.getConfig(activityPath);
    }
    catch (error) {
        // ignore config error
        return;
    }
    if (config.uploadOnSave) {
        sync_1.upload(activityPath, config).catch(output.onError);
    }
}
exports.default = autoSave;
//# sourceMappingURL=auto-save.js.map