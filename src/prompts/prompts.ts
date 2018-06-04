import { QuickPickItem, Uri, workspace, window } from 'vscode';
import { basename } from 'path';
import { DatabaseStore } from '../database/databaseStore';

namespace QuickPick {
    export class DatabaseItem implements QuickPickItem {
        uri: Uri;
        label: string;
        description: string;
        detail?: string | undefined;
        picked?: boolean | undefined;
        
        constructor(uri: Uri) {
            this.uri = uri;
            this.label = basename(uri.fsPath);
            this.description = uri.fsPath;
        }
    }
}


export function searchDatabase(onPicked?: (path: string) => void) {
    const promise = new Promise<QuickPick.DatabaseItem[]>((resolve, reject) => {
        workspace.findFiles('**/*.db', '**/*.sqlite').then((filesUri) => {
            if (filesUri.length === 0) {
                reject("No database found");
            }
            resolve(filesUri.map(uri => new QuickPick.DatabaseItem(uri)));
        });
    });
    window.showQuickPick(promise).then(
        item => {
            if (item && onPicked) {
                onPicked(item.uri.fsPath);
            }
        }
    );
}

export function chooseDatabase(databaseStore: DatabaseStore, onPicked?: (path: string) => void) {
    const promise = new Promise<QuickPick.DatabaseItem[]>((resolve, reject) => {
        if (databaseStore.getAll().length === 0) {
            reject("No database open");
        }
        resolve(databaseStore.getAll().map(db => new QuickPick.DatabaseItem(Uri.parse(db.dbPath))));
    });
    window.showQuickPick(promise).then(
        item => {
            if (item && onPicked) {
                onPicked(item.uri.fsPath);
            }
        }
    );
}