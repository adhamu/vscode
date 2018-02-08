"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const output = require("./output");
const config_1 = require("./config");
const conveyer_1 = require("./conveyer");
const remoteFs_1 = require("./remoteFs");
const localFs_1 = require("./localFs");
const fileWatcher_1 = require("./fileWatcher");
function logIgnored(result) {
    output.debug(['', `ignore: ${result.target}`].join('\n'));
}
function printFailTask(result) {
    const error = result.payload;
    const errorMsg = error.stack !== undefined ? error.stack : error.toString();
    output.debug([
        '',
        '------',
        `target: ${result.target}`,
        `context: ${result.op}`,
        `error: ${errorMsg}`,
        '------',
    ].join('\n'));
}
function printResult(msg, result, silent) {
    // return;
    const { success, fails, ignored } = []
        .concat(result)
        .filter(resultItem => typeof resultItem === 'object')
        .reduce((classification, resultItem) => {
        if (resultItem.error) {
            classification.fails.push(resultItem);
        }
        else if (resultItem.ignored) {
            classification.ignored.push(resultItem);
        }
        else {
            classification.success.push(resultItem);
        }
        return classification;
    }, {
        success: [],
        fails: [],
        ignored: [],
    });
    ignored.forEach(logIgnored);
    success.forEach(item => {
        output.debug(`${item.op} ${item.target} at ${new Date()}`);
    });
    if (fails.length) {
        fails.forEach(printFailTask);
        output.showOutPutChannel();
        output.status.msg(`${msg} done (${fails.length} fails)`, 2000);
    }
    else {
        if (silent) {
            output.status.msg('', 0);
        }
        else {
            output.status.msg(`${msg} done`, 2000);
        }
    }
}
const createTask = (name, func) => (source, config, silent = false) => {
    output.print(`\n`);
    output.debug(`task: ${name} ${source}`);
    return remoteFs_1.default(config_1.getHostInfo(config))
        .then(remotefs => func(source, config, remotefs))
        .then(result => printResult(name, result, silent));
};
exports.upload = createTask('upload', (source, config, remotefs) => conveyer_1.transport(source, config.remotePath, localFs_1.default, remotefs, {
    concurrency: config.concurrency,
    ignore: config.ignore,
    perserveTargetMode: config.protocol === 'sftp',
}));
exports.download = createTask('download', (source, config, remotefs) => {
    fileWatcher_1.disableWatcher(config);
    return conveyer_1.transport(config.remotePath, source, remotefs, localFs_1.default, {
        concurrency: config.concurrency,
        ignore: config.ignore,
        perserveTargetMode: false,
    }).then(r => {
        fileWatcher_1.enableWatcher(config);
        return r;
    }, e => {
        fileWatcher_1.enableWatcher(config);
        throw e;
    });
});
exports.sync2Remote = createTask('sync remote', (source, config, remotefs) => conveyer_1.sync(source, config.remotePath, localFs_1.default, remotefs, {
    concurrency: config.concurrency,
    ignore: config.ignore,
    model: config.syncMode,
    perserveTargetMode: true,
}));
exports.sync2Local = createTask('sync local', (source, config, remotefs) => {
    fileWatcher_1.disableWatcher(config);
    return conveyer_1.sync(config.remotePath, source, remotefs, localFs_1.default, {
        concurrency: config.concurrency,
        ignore: config.ignore,
        model: config.syncMode,
        perserveTargetMode: false,
    }).then(r => {
        fileWatcher_1.enableWatcher(config);
        return r;
    }, e => {
        fileWatcher_1.enableWatcher(config);
        throw e;
    });
});
exports.removeRemote = createTask('remove', (source, config, remotefs) => conveyer_1.remove(source, remotefs, {
    ignore: config.ignore,
    skipDir: config.skipDir,
}));
//# sourceMappingURL=sync.js.map