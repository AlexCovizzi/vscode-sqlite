import { QuickPickItem, workspace, window } from 'vscode';
import { basename } from 'path';
import { DBExplorer } from '../explorer/explorer';

namespace QuickPick {
    export class DatabaseItem implements QuickPickItem {
        path: string;
        label: string;
        description: string;
        detail?: string;
        picked?: boolean;
        
        constructor(path: string) {
            this.path = path;
            this.label = basename(path);
            this.description = path;
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

/**
 * Show a Quick Pick that lets you choose a database to open, from all the files in the workspace with extension .db or .sqlite
 * @param hint What to write in the QuickPick
 */
export function searchDatabase(hint?: string): Thenable<string> {
    const promise = new Promise<QuickPick.DatabaseItem[] | QuickPick.ErrorItem[]>((resolve, reject) => {
        workspace.findFiles('**/*.db', '**/*.sqlite').then((filesUri) => {
            if (filesUri.length === 0) {
                resolve([new QuickPick.ErrorItem('No database found.')]);
            } else {
                resolve(filesUri.map(uri => new QuickPick.DatabaseItem(uri.fsPath)));
            }
        });
    });
    return new Promise((resolve, reject) => {
        window.showQuickPick(promise, {placeHolder: hint? hint : 'Choose a database to open.'}).then( (item) => {
            if (item instanceof QuickPick.DatabaseItem) {
                resolve(item.path);
            } else {
                reject();
            }
        });
    });
}

export function pickExplorerDatabase(explorer: DBExplorer): Thenable<string> {
    let dbs = explorer.getDatabases();
    let items: QuickPick.DatabaseItem[] | QuickPick.ErrorItem[];
    if (dbs.length === 0) {
        items = [new QuickPick.ErrorItem('No database open in explorer')];
    } else {
        items = dbs.map(dbPath => new QuickPick.DatabaseItem(dbPath));
    }
    return new Promise((resolve, reject) => {
        window.showQuickPick(items, {placeHolder: 'Choose a database to close.'}).then( (item) => {
            if (item instanceof QuickPick.DatabaseItem) {
                resolve(item.path);
            } else {
                reject();
            }
        });
    });
}