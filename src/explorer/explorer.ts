import { window, commands, Disposable } from "vscode";
import { DatabaseStore } from "../database/databaseStore";
import { ExplorerTreeProvider } from "./explorerTreeProvider";

export class SQLiteExplorer implements Disposable {
    private disposable: Disposable;
    private explorerTreeProvider: ExplorerTreeProvider;

    constructor(databaseStore: DatabaseStore) {
        let subscriptions: Disposable[] = [];

        let treeDataProvider = new ExplorerTreeProvider(databaseStore);
        this.explorerTreeProvider = treeDataProvider;
        
        let treeView = window.createTreeView('extension.sqliteExplorer', { treeDataProvider });
        subscriptions.push(treeView);

        this.disposable = Disposable.from(...subscriptions);
    }

    addToExplorer(dbPath: string) {
        let added = this.explorerTreeProvider.addToTree(dbPath);
        if (added) {
            commands.executeCommand( 'setContext', 'extension.showExplorer', true);
        }
    }

    removeFromExplorer(dbPath: string) {
        let remained = this.explorerTreeProvider.removeFromTree(dbPath);
        if (remained === 0) {
            // close the explorer with a slight delay (it looks better)
            setTimeout(() => {
                commands.executeCommand( 'setContext', 'extension.showExplorer', false);
            }, 250);
        }
    }

    refreshExplorer() {
        this.explorerTreeProvider.refresh();
    }

    dispose() {
        this.disposable.dispose();
    }
}