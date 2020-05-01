'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class StatusBar {
    constructor(context, show) {
        show = true;
        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        const git = gitExtension.getAPI(1);
        this._statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this._statusBar.command = 'vscsm.openInSublimeMerge';
        this._statusBar.text = '$(git-branch) ...';
        this._statusBar.show();
        const workspaceRepos = {};
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            const g = git;
            const w = vscode.workspace;
            const wr = workspaceRepos;
            if (editor) {
                const workspaceIndex = vscode.workspace.getWorkspaceFolder(editor.document.uri).index;
                if (workspaceRepos[workspaceIndex]) {
                    this.updateStatusBar(this._statusBar, workspaceRepos[workspaceIndex]);
                    this._statusBar.show();
                }
                else {
                    this._statusBar.hide();
                }
            }
        }));
        let selectedRepo;
        git.onDidOpenRepository(repo => {
            console.log('onDidOpenRepository: ' + repo.rootUri);
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(repo.rootUri);
            if (workspaceFolder) {
                workspaceRepos[workspaceFolder.index] = repo;
            }
            repo.ui.onDidChange(() => {
                console.log('onDidOpenRepository -> repo.ui.onDidChange: ' + repo.rootUri);
                if (repo.ui.selected) {
                    selectedRepo = repo;
                }
            });
        });
        git.onDidChangeState(state => {
            console.log('onDidChangeState: ' + state);
            if (state === 'initialized') {
                git.repositories.forEach(repo => {
                    repo.ui.onDidChange(() => {
                        console.log('onDidChangeState -> repo.ui.onDidChange: ' + repo.rootUri);
                        if (repo.ui.selected) {
                            selectedRepo = repo;
                        }
                    });
                    repo.state.onDidChange(() => {
                        const x = vscode.workspace;
                        console.log('onDidChangeState -> repo.state.onDidChange: ' + repo.rootUri);
                        if (1 || selectedRepo) {
                            this.updateStatusBar(this._statusBar, repo);
                        }
                    });
                });
            }
        });
    }
    show() {
        this._statusBar.show();
    }
    hide() {
        this._statusBar.hide();
    }
    updateStatusBar(statusBar, repo) {
        const unstaged = repo.state.workingTreeChanges.length;
        const staged = repo.state.indexChanges.length;
        statusBar.text = '$(git-branch) ' + unstaged + ' $(git-commit) ' + staged;
        statusBar.tooltip = 'Open in Sublime Merge\n\nUnstaged:' + unstaged + '\nTo be committed: ' + staged;
    }
}
exports.StatusBar = StatusBar;
//# sourceMappingURL=status_bar_2.js.map