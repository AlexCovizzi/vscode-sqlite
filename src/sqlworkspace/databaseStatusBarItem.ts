import { DocumentDatabaseBindings } from "./documentDatabaseBindings";
import { StatusBarItem, window, StatusBarAlignment, Disposable, workspace } from "vscode";
import { basename } from "path";

export class DatabaseStatusBarItem implements Disposable {
    private disposable: Disposable;
    private statusBarItem: StatusBarItem;

    constructor(private documentDatabase: DocumentDatabaseBindings) {
        let subscriptions: Disposable[] = [];

        this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
        this.statusBarItem.command = "sqlite.useDatabase";
        subscriptions.push(this.statusBarItem);

        subscriptions.push(window.onDidChangeActiveTextEditor(e => this.update()));
        subscriptions.push(window.onDidChangeTextEditorViewColumn(e => this.update()));
        subscriptions.push(workspace.onDidOpenTextDocument(e => this.update()));
        subscriptions.push(workspace.onDidCloseTextDocument(e => this.update()));

        this.disposable = Disposable.from(...subscriptions);
    }

    update() {
        let doc = window.activeTextEditor && window.activeTextEditor.document.languageId === 'sql'? window.activeTextEditor.document : undefined;

        if (doc) {
            let db = this.documentDatabase.get(doc);
            let dbPath: string;
            let dbName: string;
            if (db) {
                dbPath = db;
                dbName = basename(dbPath);
            } else {
                dbPath = 'No database';
                dbName = dbPath;
            }
            this.statusBarItem.tooltip = `SQLite: ${dbPath}`;
            this.statusBarItem.text = `SQLite: ${dbName}`;
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    dispose() {
        this.disposable.dispose();
    }
}