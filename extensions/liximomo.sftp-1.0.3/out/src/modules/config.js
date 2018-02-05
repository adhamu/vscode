"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const fse = require("fs-extra");
const path = require("path");
const paths = require("../helper/paths");
const upath_1 = require("./upath");
const Joi = require("joi");
const output = require("./output");
const Trie_1 = require("./Trie");
const Ignore_1 = require("./Ignore");
const host_1 = require("../host");
const configTrie = new Trie_1.default({}, {
    delimiter: path.sep,
});
const nullable = schema => schema.optional().allow(null);
const configScheme = {
    context: Joi.string(),
    protocol: Joi.any().valid('sftp', 'ftp', 'test'),
    host: Joi.string().required(),
    port: Joi.number().integer(),
    username: Joi.string().required(),
    password: nullable(Joi.string()),
    agent: nullable(Joi.string()),
    privateKeyPath: nullable(Joi.string()),
    passphrase: nullable(Joi.string().allow(true)),
    interactiveAuth: Joi.boolean().optional(),
    secure: Joi.any()
        .valid(true, false, 'control', 'implicit')
        .optional(),
    secureOptions: nullable(Joi.object()),
    passive: Joi.boolean().optional(),
    remotePath: Joi.string().required(),
    uploadOnSave: Joi.boolean().optional(),
    syncMode: Joi.any().valid('update', 'full'),
    ignore: Joi.array()
        .min(0)
        .items(Joi.string()),
    watcher: {
        files: Joi.string()
            .allow(false, null)
            .optional(),
        autoUpload: Joi.boolean().optional(),
        autoDelete: Joi.boolean().optional(),
    },
};
const defaultConfig = {
    protocol: 'sftp',
    host: 'host',
    port: 22,
    username: 'username',
    password: null,
    agent: null,
    privateKeyPath: null,
    passphrase: null,
    interactiveAuth: false,
    secure: false,
    secureOptions: null,
    passive: false,
    remotePath: '/',
    uploadOnSave: false,
    syncMode: 'update',
    ignore: ['.vscode', '.git', '.DS_Store'],
    watcher: {
        files: false,
        autoUpload: false,
        autoDelete: false,
    },
};
function normalizeTriePath(pathname) {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
        const device = pathname.substr(0, 2);
        if (device.charAt(1) === ':') {
            // lowercase drive letter
            return pathname[0].toLowerCase() + pathname.substr(1);
        }
    }
    return path.normalize(pathname);
}
function addConfig(config, defaultContext) {
    const { error: validationError } = Joi.validate(config, configScheme, {
        convert: false,
        language: {
            object: {
                child: '!!prop "{{!child}}" fails because {{reason}}',
            },
        },
    });
    if (validationError) {
        throw new Error(`config validation fail: ${validationError.message}`);
    }
    // tslint:disable triple-equals
    let context = config.context != undefined ? config.context : defaultContext;
    context = normalizeTriePath(path.resolve(defaultContext, context));
    const withDefault = Object.assign({}, defaultConfig, config, { context });
    configTrie.add(context, withDefault);
    output.info(`config at ${context}`, withDefault);
    return withDefault;
}
function getConfigPath(basePath) {
    return path.join(basePath, constants_1.CONFIG_PATH);
}
exports.getConfigPath = getConfigPath;
function loadConfig(configPath) {
    // $todo trie per workspace, so we can remove unused config
    return fse.readJson(configPath).then(config => {
        const configs = [].concat(config);
        const configContext = path.resolve(configPath, '../../');
        return configs.map(cfg => addConfig(cfg, configContext));
    });
}
exports.loadConfig = loadConfig;
function initConfigs(basePath) {
    const configPath = getConfigPath(basePath);
    return fse.pathExists(configPath).then(exist => {
        if (exist) {
            return loadConfig(configPath);
        }
        return [];
    }, _ => []);
}
exports.initConfigs = initConfigs;
function getConfig(activityPath) {
    const config = configTrie.findPrefix(normalizeTriePath(activityPath));
    if (!config) {
        throw new Error(`(${activityPath}) config file not found`);
    }
    const ignore = Ignore_1.default.from(config.ignore);
    const localContext = config.context;
    const remoteContext = config.remotePath;
    return Object.assign({}, config, { remotePath: paths.toRemote(path.relative(localContext, activityPath), remoteContext), ignore(fsPath) {
            // vscode will always return path with / as separator
            const normalizedPath = path.normalize(fsPath);
            let relativePath;
            if (normalizedPath.indexOf(localContext) === 0) {
                // local path
                relativePath = path.relative(localContext, fsPath);
            }
            else {
                // remote path
                relativePath = upath_1.default.relative(remoteContext, fsPath);
            }
            // skip root
            return relativePath !== '' && ignore.ignores(relativePath);
        } });
}
exports.getConfig = getConfig;
function getAllConfigs() {
    if (configTrie === undefined) {
        return [];
    }
    return configTrie.getAllValues();
}
exports.getAllConfigs = getAllConfigs;
function getShortestDistinctConfigs() {
    if (configTrie === undefined) {
        return [];
    }
    return configTrie.findValuesWithShortestBranch();
}
exports.getShortestDistinctConfigs = getShortestDistinctConfigs;
function newConfig(basePath) {
    const configPath = getConfigPath(basePath);
    return fse
        .pathExists(configPath)
        .then(exist => {
        if (exist) {
            return host_1.showTextDocument(configPath);
        }
        return fse
            .outputJson(configPath, {
            protocol: defaultConfig.protocol,
            host: defaultConfig.host,
            username: defaultConfig.username,
            remotePath: defaultConfig.remotePath,
        }, { spaces: 4 })
            .then(() => host_1.showTextDocument(configPath));
    })
        .catch(error => {
        output.onError(error, 'config');
    });
}
exports.newConfig = newConfig;
function getHostInfo(config) {
    return {
        protocol: config.protocol,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        // sftp
        agent: config.agent,
        privateKeyPath: config.privateKeyPath,
        passphrase: config.passphrase,
        interactiveAuth: config.interactiveAuth,
        // ftp
        secure: config.secure,
        secureOptions: config.secureOptions,
        passive: config.passive,
    };
}
exports.getHostInfo = getHostInfo;
//# sourceMappingURL=config.js.map