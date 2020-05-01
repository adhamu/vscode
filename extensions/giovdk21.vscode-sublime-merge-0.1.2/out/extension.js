'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configuration");
const LoggingService_1 = require("./lib/LoggingService");
const commands_1 = require("./commands");
const status_bar_1 = require("./status_bar");
let statusBar;
// this method is called when the extension is activated
function activate(context) {
    const config = new configuration_1.Configuration();
    const loggingService = new LoggingService_1.LoggingService(config);
    commands_1.registerCommands(context);
    statusBar = new status_bar_1.StatusBar(config.showInStatusBar, loggingService);
    context.subscriptions.push(config.onDidShowInStatusBarChange(() => {
        config.showInStatusBar ? statusBar.enable() : statusBar.disable();
    }));
}
exports.activate = activate;
// this method is called when the extension is deactivated
function deactivate() {
    statusBar.disposeSubscriptions();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map