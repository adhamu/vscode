"use strict";
/*! Copyright (c) Microsoft Corporation. All rights reserved. */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const genericErrorMessage = "Cannot start IntelliCode support for Python. See output window for more details.";
const defaultAnalyzerName = "intellisense-members";
const lstmAnalyzerName = "intellisense-members-lstm";
const scopesToTry = [
    vscode.ConfigurationTarget.Global,
    vscode.ConfigurationTarget.Workspace,
    vscode.ConfigurationTarget.WorkspaceFolder
];
const notificationMessage = "IntelliCode Python support requires you to use the Microsoft Python Language Server (preview).";
const actionLabel = "Enable it and Reload Window";
class PythonSupport {
    getRequestedConfig() {
        const pythonExtension = vscode.extensions.getExtension("ms-python.python");
        if (!pythonExtension) {
            return [];
        }
        const json = pythonExtension.packageJSON;
        const jediEnabledExists = json.contributes.configuration.properties['python.jediEnabled'] !== undefined;
        if (!json.languageServerVersion) {
            return [];
        }
        if (jediEnabledExists) {
            return [{
                    scopeName: "python",
                    settingName: "jediEnabled",
                    desiredValue: false,
                    required: true,
                    scopesToTry,
                    reloadWindowAfterApplying: true,
                    notificationMessage,
                    actionLabel
                }];
        }
        let config = vscode.workspace.getConfiguration('python');
        if (config && config.get('languageServer') !== "Node") {
            return [{
                    scopeName: "python",
                    settingName: "languageServer",
                    desiredValue: 'Microsoft',
                    required: true,
                    scopesToTry,
                    reloadWindowAfterApplying: true,
                    notificationMessage,
                    actionLabel
                }];
        }
        return [];
    }
    async activate(api, logger) {
        const pythonExtension = vscode.extensions.getExtension("ms-python.python");
        if (!pythonExtension) {
            const err = "Microsoft Python extension is not installed.";
            logger(err);
            return Promise.reject(err);
        }
        let config = vscode.workspace.getConfiguration('python');
        if (!config) {
            logger("Unable to find Python configuration section.");
            return;
        }
        let ls = config.get('languageServer');
        const extensionV2 = pythonExtension.packageJSON.languageServerVersionV1;
        if (extensionV2 && ls !== "Microsoft v1") {
            return;
        }
        if (ls === "None" || ls === "Node") {
            return;
        }
        if (ls === 'Jedi') {
            for (const scope of scopesToTry) {
                await config.update("languageServer", "Microsoft", scope);
                config = vscode.workspace.getConfiguration('python');
                ls = config.get('languageServer');
                if (ls === "Microsoft") {
                    break;
                }
            }
        }
        let useDeepLearning = api.isFeatureEnabled("python.deepLearning");
        let analyzerName = useDeepLearning ? lstmAnalyzerName : defaultAnalyzerName;
        let model = await api.ModelAcquisitionService
            .getModelProvider("python", analyzerName)
            .getModelAsync();
        if (model === undefined && analyzerName === lstmAnalyzerName) {
            logger("No deep learning model available for Python, fall back to the default model.");
            analyzerName = defaultAnalyzerName;
            model = await api.ModelAcquisitionService
                .getModelProvider("python", analyzerName)
                .getModelAsync();
        }
        if (model === undefined) {
            logger("No model available for Python, cannot continue.");
            return Promise.resolve();
        }
        let modelJson = JSON.stringify(model);
        logger(`vs-intellicode-python was passed a model: ${modelJson}.`);
        if (!pythonExtension.isActive) {
            await pythonExtension.activate();
        }
        await pythonExtension.exports.ready;
        let intelliCodeAssemblyName = useDeepLearning ? "IntelliCodeForPythonLstm.dll" : "IntellicodeForPython2.dll";
        let assemblyPath = path_1.default.join(__dirname, intelliCodeAssemblyName);
        try {
            fs_1.default.accessSync(assemblyPath, fs_1.default.constants.F_OK);
        }
        catch (err) {
            logger(`Python Language Server extension assembly doesn't exist in ${assemblyPath}. Please reinstall IntelliCode.`);
            return Promise.reject(err);
        }
        let command = vscode.commands.executeCommand("python._loadLanguageServerExtension", {
            assembly: assemblyPath,
            typeName: "Microsoft.PythonTools.Analysis.Pythia.LanguageServerExtensionProvider",
            properties: {
                modelPath: model.modelPath
            }
        });
        if (command == null) {
            logger("Couldn't find language server extension command. Is the installed version of Python 2018.7.0 or later?");
            return Promise.reject(new Error(genericErrorMessage));
        }
        await command;
        logger("Loaded language server extension.");
        return Promise.resolve();
    }
}
exports.PythonSupport = PythonSupport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnNjb2RlLWludGVsbGljb2RlLXB5dGhvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92c2NvZGUtaW50ZWxsaWNvZGUtcHl0aG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnRUFBZ0U7Ozs7Ozs7Ozs7OztBQUVoRSwrQ0FBaUM7QUFFakMsZ0RBQXdCO0FBQ3hCLDRDQUFvQjtBQUVwQixNQUFNLG1CQUFtQixHQUFXLGtGQUFrRixDQUFDO0FBQ3ZILE1BQU0sbUJBQW1CLEdBQUcsc0JBQXNCLENBQUM7QUFDbkQsTUFBTSxnQkFBZ0IsR0FBRywyQkFBMkIsQ0FBQztBQUNyRCxNQUFNLFdBQVcsR0FBRztJQUNoQixNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTTtJQUNqQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUztJQUNwQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsZUFBZTtDQUM3QyxDQUFDO0FBQ0YsTUFBTSxtQkFBbUIsR0FBRyxnR0FBZ0csQ0FBQztBQUM3SCxNQUFNLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQztBQUVsRDtJQUtJLGtCQUFrQjtRQVVkLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNsQixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQztRQUN6QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLFNBQVMsQ0FBQztRQUV4RyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBRzdCLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLGlCQUFpQixFQUFFO1lBR25CLE9BQU8sQ0FBQztvQkFDSixTQUFTLEVBQUUsUUFBUTtvQkFD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