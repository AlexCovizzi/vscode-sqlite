import { window, commands, Disposable } from "vscode";
import { ExplorerTreeProvider } from "./explorerTreeProvider";
import { QueryRunner } from "../database/queryRunner";

export class SQLiteExplorer implements Disposable {
    private disposable: Disposable;
    private explorerTreeProvider: ExplorerTreeProvider;

    constructor(queryRunner: QueryRunner) {
        let subscriptions: Disposable[] = [];

        let treeDataProvider = new ExplorerTreeProvider(queryRunner);
        this.explorerTreeProvider = treeDataProvider;
        
        let treeView = window.createTreeView('sqlite.sqliteExplorer', { treeDataProvider });
        subscriptions.push(treeView);

        this.disposable = Disposable.from(...subscriptions);
    }

    addToExplorer(dbPath: string) {
        let added = this.explorerTreeProvider.addToTree(dbPath);
        if (added) {
            commands.executeCommand( 'setContext', 'sqlite.showExplorer', true);
        }
    }

    removeFromExplorer(dbPath: string) {
        let remained = this.explorerTreeProvider.removeFromTree(dbPath);
        if (remained === 0) {
            // close the explorer with a slight delay (it looks better)
            setTimeout(() => {
                commands.executeCommand( 'setContext', 'sqlite.showExplorer', false);
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