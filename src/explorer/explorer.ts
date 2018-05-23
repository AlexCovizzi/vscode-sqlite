import { TreeView, window, ExtensionContext, commands, Uri } from "vscode";
import { DatabaseStore } from "../models/databaseStore";
import { ExplorerTreeProvider } from "./explorerTreeProvider";
import { SQLItem, DBItem } from "./treeItem";

export class SQLiteExplorer {
    private sqliteViewer: TreeView<SQLItem>;

    constructor(context: ExtensionContext, databaseStore: DatabaseStore) {
        let treeDataProvider = new ExplorerTreeProvider(databaseStore);
        
        this.sqliteViewer = window.createTreeView('sqliteExplorer', { treeDataProvider });

        // register explorer commands
        //commands.registerCommand('extension.revealResource', () => this.reveal());
        context.subscriptions.push(commands.registerCommand('extension.showExplorer', () => {
            this.onShowExplorer();
        }));
        context.subscriptions.push(commands.registerCommand('extension.hideExplorer', (dbUri: Uri) => {
            this.onHideExplorer();
        }));
        context.subscriptions.push(commands.registerCommand('extension.addToExplorer', (dbUri: Uri) => {
            this.onAddToExplorer(treeDataProvider, dbUri.fsPath);
        }));
        context.subscriptions.push(commands.registerCommand('extension.removeFromExplorer', (dbItem: DBItem) => {
            this.onRemoveFromExplorer(treeDataProvider, dbItem.dbPath);
        }));
        context.subscriptions.push(commands.registerCommand('extension.refreshExplorer', () => {
            this.onRefreshExplorer(treeDataProvider);
        }));
    }

    private onShowExplorer() {
        commands.executeCommand( 'setContext', 'extension.showExplorer', true);
    }

    private onHideExplorer() {
        commands.executeCommand( 'setContext', 'extension.showExplorer', false);
    }

    private onAddToExplorer(treeDataProvider: ExplorerTreeProvider, dbPath: string) {
        let added = treeDataProvider.add(dbPath);
        if (added) {
            commands.executeCommand('extension.showExplorer');
        }
    }

    private onRemoveFromExplorer(treeDataProvider: ExplorerTreeProvider, dbPath: string) {
        let remained = treeDataProvider.remove(dbPath);
        if (remained === 0) {
            setTimeout(() => {
                commands.executeCommand('extension.hideExplorer');
            }, 500);
        }
    }

    private onRefreshExplorer(treeDataProvider: ExplorerTreeProvider) {
        treeDataProvider.refresh();
    }

    dispose() {

    }
}