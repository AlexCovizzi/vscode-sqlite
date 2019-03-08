import { QuickPickItem, workspace, window, CancellationTokenSource, CancellationToken } from 'vscode';
import { basename } from 'path';

export namespace QuickPick {
    export class DatabaseItem implements QuickPickItem {
        path: string;
        label: string;
        description: string;
        detail?: string;
        picked?: boolean;
        
        constructor(path: string, description?: string) {
            this.path = path;
            this.label = basename(path);
            this.description = description? description : path;
        }
    }
    export class FileDialogItem implements QuickPickItem {
        label: string;
        description: string;
        detail?: string;
        picked?: boolean;
        
        constructor() {
            this.label = "Choose database from file";
            this.description = "";
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
 * Show a Quick Pick that lets you choose a database to open from all the files in the workspace with extension .db or .sqlite
 * @param hint What to write in the QuickPick
 */
export function pickWorkspaceDatabase(autopick: boolean, includeMemory: boolean = true, hint?: string): Thenable<string> {
    const sqlite_file_extensions = ["db", "db3", "sqlite", "sqlite3", "sdb", "s3db"];
    const promise = new Promise< Array<QuickPick.DatabaseItem | QuickPick.ErrorItem | QuickPick.FileDialogItem> >((resolve) => {
        workspace.findFiles('**/*.{'+sqlite_file_extensions.join(",")+'}').then((filesUri) => {
            let fileDialogItem = new QuickPick.FileDialogItem();
            let items: Array<QuickPick.DatabaseItem | QuickPick.ErrorItem | QuickPick.FileDialogItem> = filesUri.map(uri => new QuickPick.DatabaseItem(uri.fsPath));
            if (includeMemory) items.push(new QuickPick.DatabaseItem(":memory:", "sqlite in-memory database"));
            items.push(fileDialogItem);
            resolve(items);
        });
    });
    return new Promise( (resolve, reject) => {
        hint = hint? hint : 'Choose a database.';
        showAutoQuickPick(autopick, promise, hint).then(
            item => {
                if (item instanceof QuickPick.DatabaseItem) {
                    resolve(item.path);
                } else if (item instanceof QuickPick.FileDialogItem) {
                    window.showOpenDialog({filters: {"Database": sqlite_file_extensions}}).then(fileUri => {
                        if (fileUri) {
                            resolve(fileUri[0].fsPath);
                        } else {
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            }
        );
    });
}

export function pickListDatabase(autopick: boolean, dbs: string[]): Thenable<string> {
    let items: QuickPick.DatabaseItem[] | QuickPick.ErrorItem[];
    if (dbs.length === 0) {
        //items = [new QuickPick.ErrorItem('No database found.')];
        items = [];
    } else {
        items = dbs.map(dbPath => new QuickPick.DatabaseItem(dbPath));
    }
    return new Promise((resolve, reject) => {
        showAutoQuickPick(autopick, items, 'Choose a database to close.').then( (item) => {
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
export function showAutoQuickPick(autopick: boolean, items: QuickPickItem[] | Thenable<QuickPickItem[]>, hint?: string): Thenable<QuickPickItem> {
    
    if (autopick && items instanceof Array && items.length === 1) {
        let item = items[0];
        return new Promise(resolve => resolve(item));
    } else {
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
                resolve(item);
                
                if (cancTockenSource) {
                    cancTockenSource.dispose();
                }
            });
        });
    }
}