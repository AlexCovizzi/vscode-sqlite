'use strict';

import { DatabaseStore } from './models/databaseStore';
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
        openDatabase(databaseStore, dbUri);
    }));
    context.subscriptions.push(commands.registerCommand('extension.closeDatabase', (dbItem: DBItem) => {
        closeDatabase(databaseStore, dbItem);
    }));
}

function openDatabase(databaseStore: DatabaseStore, dbUri: Uri) {
    let database = databaseStore.add(dbUri.fsPath);
    if (database) {
        commands.executeCommand('extension.addToExplorer', dbUri);
    }
}

function closeDatabase(databaseStore: DatabaseStore, dbItem: DBItem) {
    databaseStore.remove(dbItem.dbPath);
    commands.executeCommand('extension.removeFromExplorer', dbItem);
}

// this method is called when your extension is deactivated
export function deactivate() {
}