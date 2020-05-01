'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class StatusBar {
    constructor(show, loggingService) {
        this._workspaceRepos = {};
        this._subscriptions = [];
        this._repoSubscriptions = [];
        this._loggingService = loggingService;
        this._git = this._gitAPI;
        this._statusBar = this._setup();
        if (show) {
            this.enable();
        }
    }
    enable() {
        this._loggingService.logInfo('Enabling Status Bar');
        this._loadRepositories();
        this._setupSubscriptions();
        this._statusBar.show();
    }
    disable() {
        this._loggingService.logInfo('Disabling Status Bar');
        this._statusBar.hide();
        this.disposeSubscriptions();
    }
    disposeSubscriptions() {
        this._resetRepositories();
        this._loggingService.logInfo('Dispose Subscriptions');
        this._subscriptions.every(subscription => {
            subscription.dispose();
        });
        this._subscriptions = [];
    }
    _setupSubscriptions() {
        if (this._subscriptions.length === 0) {
            this._subscriptions.push(vscode.window.onDidChangeActiveTextEditor(this._handleActiveTextEditorChange, this));
            this._subscriptions.push(this._git.onDidOpenRepository(this._handleOpenRepository, this));
            this._subscriptions.push(this._git.onDidChangeState(this._handleDidChangeState, this));
            this._subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
                this._resetRepositories();
                this._loadRepositories();
            }));
            this._loggingService.logInfo('Setup Subscriptions (' + this._subscriptions.length + ')');
        }
    }
    _disposeRepoSubscriptions() {
        this._loggingService.logInfo('Dispose Repo Subscriptions');
        this._repoSubscriptions.every(subscription => {
            subscription.dispose();
        });
        this._repoSubscriptions = [];
    }
    _setupRepoSubscriptions(repo) {
        this._loggingService.logInfo('Setup subscriptions for repo: ' + repo.rootUri.toString());
        this._repoSubscriptions.push(repo.state.onDidChange(() => {
            this._loggingService.logInfo('Repo State Change');
            this._updateStatusBarForActiveEditor();
        }));
        this._repoSubscriptions.push(repo.ui.onDidChange(() => {
            if (repo.ui.selected) {
                this._loggingService.logInfo('Repo UI Change');
                this._updateStatusBar(repo);
            }
        }));
    }
    _setup() {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        statusBar.command = 'vscsm.openInSublimeMerge';
        this._reset(statusBar);
        return statusBar;
    }
    _reset(statusBar) {
        this._loggingService.logInfo('reset');
        statusBar.text = '$(git-branch) ...';
        statusBar.tooltip = '';
    }
    _updateStatusBar(repo) {
        const unstaged = repo.state.workingTreeChanges.length;
        const staged = repo.state.indexChanges.length;
        this._loggingService.logInfo('Update Status Bar');
        this._statusBar.text = '$(git-branch) ' + unstaged + ' $(git-commit) ' + staged;
        this._statusBar.tooltip = 'Open in Sublime Merge\n\nUnstaged: ' + unstaged + '\nTo be committed: ' + staged;
    }
    _updateStatusBarForActiveEditor() {
        const repo = this._editorRepository(vscode.window.activeTextEditor);
        if (repo) {
            this._updateStatusBar(repo);
        }
    }
    get _gitAPI() {
        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        return gitExtension.getAPI(1);
    }
    _editorRepository(editor) {
        if (editor) {
            const workspaceIndex = vscode.workspace.getWorkspaceFolder(editor.document.uri).index;
            if (this._workspaceRepos[workspaceIndex]) {
                return this._workspaceRepos[workspaceIndex];
            }
        }
        return null;
    }
    _handleActiveTextEditorChange(editor) {
        const repo = this._editorRepository(editor);
        if (repo) {
            this._loggingService.logInfo('Active Text Editor Change -> Has Repo');
            this._updateStatusBar(repo);
            this._statusBar.show();
        }
        else {
            this._loggingService.logInfo('Active Text Editor Change -> No Repo');
            this._reset(this._statusBar);
            this._statusBar.hide();
        }
    }
    _resetRepositories() {
        this._loggingService.logInfo('Reset repositories');
        this._disposeRepoSubscriptions();
        this._workspaceRepos = {};
    }
    _loadRepositories() {
        if (this._git.state === 'initialized') {
            this._git.repositories.forEach(repo => {
                this._addWorkspaceRepo(repo);
            });
            this._loggingService.logInfo('Loaded workspace repositories');
        }
    }
    _addWorkspaceRepo(repo) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(repo.rootUri);
        if (workspaceFolder && !this._workspaceRepos[workspaceFolder.index]) {
            this._loggingService.logInfo('Add Workspace Repo. ' + workspaceFolder.index + ': ' + repo.rootUri.toString());
            this._setupRepoSubscriptions(repo);
            this._workspaceRepos[workspaceFolder.index] = repo;
        }
    }
    _handleOpenRepository(repo) {
        this._loggingService.logInfo('_handleOpenRepository: ' + repo.rootUri.toString());
        this._addWorkspaceRepo(repo);
    }
    _handleDidChangeState(state) {
        this._loggingService.logInfo('_handleDidChangeState: ' + state);
        if (state === 'initialized') {
            this._loadRepositories();
        }
    }
}
exports.StatusBar = StatusBar;
//# sourceMappingURL=status_bar.js.map