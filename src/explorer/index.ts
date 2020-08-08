import { Disposable, commands, window, ExtensionContext } from "vscode";
import { ExplorerTreeProvider } from "./explorerTreeProvider";
import * as treeItem from "./treeItem";
import { Constants } from "../constants/constants";
import { Schema } from "../common";

class Explorer implements Disposable {

    private disposable: Disposable;

    private explorerTreeProvider: ExplorerTreeProvider;

    constructor(context: ExtensionContext) {
        let subscriptions = [];

        this.explorerTreeProvider = new ExplorerTreeProvider(context);
        subscriptions.push(window.createTreeView(Constants.sqliteExplorerViewId, { treeDataProvider: this.explorerTreeProvider }));

        this.disposable = Disposable.from(...subscriptions);
    }

    add(database: Schema.Database) {
        let length = this.explorerTreeProvider.addToTree(database);
        if (length > 0) commands.executeCommand( 'setContext', 'sqlite.explorer.show', true);
    }

    remove(dbPath: string) {
        let length = this.explorerTreeProvider.removeFromTree(dbPath);
        if (length === 0) {
            // close the explorer with a slight delay (it looks better)
            setTimeout(() => {
                commands.executeCommand( 'setContext', 'sqlite.explorer.show', false);
            }, 100);
        }
    }

    list() {
        return this.explorerTreeProvider.getDatabaseList();
    }

    refresh() {
        this.explorerTreeProvider.refresh();
    }

    dispose() {
        this.disposable.dispose();
    }
}

export type SQLItem = treeItem.SQLItem;
export type DBItem = treeItem.DBItem;
export type TableItem = treeItem.TableItem;
export type ColumnItem = treeItem.ColumnItem;

export default Explorer;