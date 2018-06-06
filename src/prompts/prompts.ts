import { QuickPickItem, Uri, workspace, window } from 'vscode';
import { basename } from 'path';
import { DatabaseStore } from '../database/databaseStore';

namespace QuickPick {
    export class DatabaseItem implements QuickPickItem {
        uri: Uri;
        label: string;
        description: string;
        detail?: string;
        picked?: boolean;
        
        constructor(uri: Uri) {
            this.uri = uri;
            this.label = basename(uri.fsPath);
            this.description = uri.fsPath;
        }
    }
    export class ErrorItem implements QuickPickItem {
        label: string;
        description?: string;
        detail?: string;
        picked?: boolean;
        
        constructor(label: string) {
            this.label = label;
        }
    }
}


export function searchDatabase(hint?: string): Thenable<string> {
    const promise = new Promise<QuickPick.DatabaseItem[] | QuickPick.ErrorItem[]>((resolve, reject) => {
        workspace.findFiles('**/*.db', '**/*.sqlite').then((filesUri) => {
            if (filesUri.length === 0) {
                resolve([new QuickPick.ErrorItem('No database found.')]);
            } else {
                resolve(filesUri.map(uri => new QuickPick.DatabaseItem(uri)));
            }
        });
    });
    return new Promise((resolve, reject) => {
        window.showQuickPick(promise, {placeHolder: hint? hint : 'Choose a database to open.'}).then( (item) => {
            if (item instanceof QuickPick.DatabaseItem) {
                resolve(item.uri.fsPath);
            } else {
                reject('No database found.');
            }
        });
    });
}

export function chooseDatabase(databaseStore: DatabaseStore, hint?: string, fallbackToSearch?: boolean): Thenable<string> {
    if (databaseStore.empty() && fallbackToSearch) {
        return searchDatabase();
    }

    const promise = new Promise<QuickPick.DatabaseItem[] | QuickPick.ErrorItem[]>((resolve, reject) => {
        if (databaseStore.empty()) {
            resolve([new QuickPick.ErrorItem("No database open.")]);
        }
        resolve(databaseStore.getAll().map(db => new QuickPick.DatabaseItem(Uri.parse(db.dbPath))));
    });
    return new Promise((resolve, reject) => {
        window.showQuickPick(promise, {placeHolder: hint? hint : 'Choose a database.'}).then( (item) => {
            if (item instanceof QuickPick.DatabaseItem) {
                resolve(item.uri.fsPath);
            } else {
                reject('No database open.');
            }
        });
    });
}