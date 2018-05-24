import { window, commands, Disposable } from "vscode";
import { DatabaseStore } from "../database/databaseStore";
import { ExplorerTreeProvider } from "./explorerTreeProvider";

export class SQLiteExplorer implements Disposable {
    private disposable: Disposable;

    constructor(databaseStore: DatabaseStore) {
        let subscriptions: Disposable[] = [];

        let treeDataProvider = new ExplorerTreeProvider(databaseStore);
        
        window.createTreeView('extension.sqliteExplorer', { treeDataProvider });

        // register explorer commands
        subscriptions.push(commands.registerCommand('extension.addToExplorer', (dbPath: string) => {
            this.onAddToExplorer(treeDataProvider, dbPath);
        }));
        subscriptions.push(commands.registerCommand('extension.removeFromExplorer', (dbPath: string) => {
            this.onRemoveFromExplorer(treeDataProvider, dbPath);
        }));
        subscriptions.push(commands.registerCommand('extension.refreshExplorer', () => {
            this.onRefreshExplorer(treeDataProvider);
        }));

        this.disposable = Disposable.from(...subscriptions);
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
            // close the explorer with a slight delay (it looks better)
            setTimeout(() => {
                commands.executeCommand( 'setContext', 'extension.showExplorer', false);
            }, 250);
        }
    }

    private onRefreshExplorer(treeDataProvider: ExplorerTreeProvider) {
        treeDataProvider.refresh();
    }

    dispose() {
        this.disposable.dispose();
    }
}