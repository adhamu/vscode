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
const createCommand_1 = require("../helper/createCommand");
const select_1 = require("../helper/select");
const paths = require("../helper/paths");
const output = require("../modules/output");
const upath_1 = require("../modules/upath");
const config_1 = require("../modules/config");
const sync_1 = require("../modules/sync");
const config_2 = require("../modules/config");
const remoteFs_1 = require("../modules/remoteFs");
const Ignore_1 = require("../modules/Ignore");
const FileSystem_1 = require("../model/Fs/FileSystem");
const host_1 = require("../host");
const configIngoreCreator = configs => {
    const filterConfigs = configs.map(config => ({
        context: config.remotePath,
        filter: Ignore_1.default.from(config.ignore).createFilter(),
    }));
    const filter = file => {
        const filterConfig = filterConfigs.find(f => paths.isSubpathOf(f.context, file.fsPath));
        if (!filterConfig) {
            return true;
        }
        // $fix 目前不能确保相对路径不出错，upath 会导致 unix 有效的\\文件名被转化成路径分割符
        const relativePath = upath_1.default.relative(filterConfig.context, file.fsPath);
        if (relativePath === '') {
            return true;
        }
        return filterConfig.filter(upath_1.default.relative(filterConfig.context, file.fsPath));
    };
    return filter;
};
function createList({ filterCreator = null, respectIgnore = true, showDotFiles = true, } = {}) {
    return () => __awaiter(this, void 0, void 0, function* () {
        const configs = config_1.getAllConfigs();
        const remoteItems = configs.map((config, index) => ({
            description: config.host,
            fsPath: config.remotePath,
            getFs: () => remoteFs_1.default(config_2.getHostInfo(config)),
            index,
        }));
        const selected = yield select_1.listFiles(remoteItems, {
            filter: filterCreator ? filterCreator(configs) : undefined,
        });
        if (!selected) {
            return;
        }
        const config = configs[selected.index];
        const localTarget = paths.toLocal(path.relative(config.remotePath, selected.fsPath), config.context);
        const ignore = Ignore_1.default.from(config.ignore);
        const remoteContxt = config.remotePath;
        const ignoreFunc = fsPath => {
            // $fix
            const relativePath = upath_1.default.relative(remoteContxt, fsPath);
            // skip root
            return relativePath !== '' && ignore.ignores(relativePath);
        };
        try {
            yield sync_1.download(localTarget, Object.assign({}, config, { remotePath: selected.fsPath, ignore: respectIgnore ? ignoreFunc : undefined }));
            if (selected.type === FileSystem_1.FileType.Directory) {
                yield host_1.refreshExplorer();
                yield host_1.focusOpenEditors();
            }
            else {
                host_1.showTextDocument(localTarget);
            }
        }
        catch (error) {
            output.debug(error);
        }
    });
}
exports.listAllCommand = createCommand_1.default(createList({
    respectIgnore: false,
}));
exports.listCommand = createCommand_1.default(createList({
    filterCreator: configIngoreCreator,
    respectIgnore: true,
}));
//# sourceMappingURL=list.js.map