'use strict';

import { DatabaseStore } from './database/databaseStore';
import { getSqlitePath } from './utils';
import { Uri, commands, ExtensionContext } from 'vscode';
import { SQLiteExplorer } from './explorer/explorer';
import { DBItem } from './explorer/treeItem';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "vscode-sqlite" is now active!');

    const extensionPath = context.extensionPath;

    const databaseStore = new DatabaseStore(getSqlitePath(extensionPath));
    const explorerController = new SQLiteExplorer(context, databaseStore);

    context.subscriptions.push(databaseStore);
    context.subscriptions.push(explorerController);

    /* commands */
    context.subscriptions.push(commands.registerCommand('extension.openDatabase', (dbUri: Uri) => {
        onOpenDatabase(databaseStore, dbUri.fsPath);
    }));
    context.subscriptions.push(commands.registerCommand('extension.closeDatabase', (dbItem: DBItem) => {
        onCloseDatabase(databaseStore, dbItem.dbPath);
    }));

}

function onOpenDatabase(databaseStore: DatabaseStore, dbPath: string) {
    let database = databaseStore.openDatabase(dbPath);
    if (database) {
        commands.executeCommand('extension.addToExplorer', dbPath);
    }
}

function onCloseDatabase(databaseStore: DatabaseStore, dbPath: string) {
    databaseStore.closeDatabase(dbPath);
    commands.executeCommand('extension.removeFromExplorer', dbPath);
}

// this method is called when your extension is deactivated
export function deactivate() {
}