import { TreeView, window, ExtensionContext, commands, Uri } from "vscode";
import { DatabaseStore } from "../database/databaseStore";
import { ExplorerTreeProvider } from "./explorerTreeProvider";
import { SQLItem, DBItem } from "./treeItem";

export class SQLiteExplorer {
    private sqliteViewer: TreeView<SQLItem>;

    constructor(context: ExtensionContext, databaseStore: DatabaseStore) {
        let treeDataProvider = new ExplorerTreeProvider(databaseStore);
        
        this.sqliteViewer = window.createTreeView('sqliteExplorer', { treeDataProvider });

        // register explorer commands
        //commands.registerCommand('extension.revealResource', () => this.reveal());
        context.subscriptions.push(commands.registerCommand('extension.addToExplorer', (dbPath: string) => {
            this.onAddToExplorer(treeDataProvider, dbPath);
        }));
        context.subscriptions.push(commands.registerCommand('extension.removeFromExplorer', (dbPath: string) => {
            this.onRemoveFromExplorer(treeDataProvider, dbPath);
        }));
        context.subscriptions.push(commands.registerCommand('extension.refreshExplorer', () => {
            this.onRefreshExplorer(treeDataProvider);
        }));
    }

    private onAddToExplorer(treeDataProvider: ExplorerTreeProvider, dbPath: string) {
        let added = treeDataProvider.addToTree(dbPath);
        if (added) {
            commands.executeCommand( 'setContext', 'extension.showExplorer', true);
        }
    }

    private onRemoveFromExplorer(treeDataProvider: ExplorerTreeProvider, dbPath: string) {
        let remained = treeDataProvider.removeFromTree(dbPath);
        if (remained === 0) {
            setTimeout(() => {
                commands.executeCommand( 'setContext', 'extension.showExplorer', false);
            }, 500);
        }
    }

    private onRefreshExplorer(treeDataProvider: ExplorerTreeProvider) {
        treeDataProvider.refresh();
    }

    dispose() {

    }
}