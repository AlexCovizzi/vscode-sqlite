import { QuickPickItem, workspace, window, CancellationTokenSource, CancellationToken } from 'vscode';
import { basename } from 'path';
import { DBExplorer } from '../explorer/explorer';
import { Configuration } from '../configurations/configurations';

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
        stack?: string | undefined;
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
export function pickWorkspaceDatabase(hint?: string): Thenable<string> {
    const promise = new Promise<QuickPick.DatabaseItem[] | QuickPick.ErrorItem[]>((resolve) => {
        workspace.findFiles('**/*.{db,sqlite,sqlite3}').then((filesUri) => {
            if (filesUri.length === 0) {
                //resolve([new QuickPick.ErrorItem('No database found.')]);
                resolve([]);
            } else {
                resolve(filesUri.map(uri => new QuickPick.DatabaseItem(uri.fsPath)));
            }
        });
    });
    return new Promise( (resolve, reject) => {
        hint = hint? hint : 'Choose a database.';
        showAutoQuickPick(promise, hint).then(
            item => {
                if (item instanceof QuickPick.DatabaseItem) {
                    resolve(item.path);
                } else {
                    reject();
                }
            }
        );
    });
}

export function pickExplorerDatabase(explorer: DBExplorer): Thenable<string> {
    let dbs = explorer.getDatabases();
    let items: QuickPick.DatabaseItem[] | QuickPick.ErrorItem[];
    if (dbs.length === 0) {
        //items = [new QuickPick.ErrorItem('No database open in explorer')];
        items = [];
    } else {
        items = dbs.map(dbPath => new QuickPick.DatabaseItem(dbPath));
    }
    return new Promise((resolve, reject) => {
        showAutoQuickPick(items, 'Choose a database to close.').then( (item) => {
            if (item instanceof QuickPick.DatabaseItem) {
                resolve(item.path);
            } else {
                reject();
            }
        });
    });
}

/**
 * Show a selection list that returns immediatly if autopick is true and there is only one item.
 * Autopick depends on the configuration sqlite.autopick
 * @param hint 
 */
function showAutoQuickPick(items: QuickPickItem[] | Thenable<QuickPickItem[]>, hint?: string): Thenable<QuickPickItem> {
    const autopick = Configuration.autopick();

    if (autopick && items instanceof Array && items.length === 1) {
        let item = items[0];
        return new Promise(resolve => resolve(item));
    }
    
    return new Promise((resolve, reject) => {
        let cancTockenSource: CancellationTokenSource | undefined;
        let cancToken: CancellationToken | undefined;

        /* items is a Thenable, if there is only one item
           i need to resolve the only item and cancel the quickpick */
        if (autopick && !(items instanceof Array)) {
            cancTockenSource = new CancellationTokenSource();
            cancToken = cancTockenSource.token;

            items.then( items => {
                if (items.length === 1) {
                    let item = items[0];
                    resolve(item);

                    if (cancTockenSource) {
                        cancTockenSource.cancel();
                        cancTockenSource.dispose();
                    }
                }
            });
        }

        window.showQuickPick(items, {placeHolder: hint? hint : ''}, cancToken).then( item => {
            if ( item ) {
                resolve(item);
            } else {
                resolve(undefined);
            }
            
            if (cancTockenSource) {
                cancTockenSource.dispose();
            }
        });
    });
}