import { DocumentDatabase } from "../sqlDocument/documentDatabase";
import { StatusBarItem, window, StatusBarAlignment, Disposable, workspace } from "vscode";
import { getEditorSqlDocument } from "../sqlDocument/sqlDocument";
import { basename } from "path";

export class DocumentDatabaseStatusBar implements Disposable {
    private disposable: Disposable;
    private statusBarItem: StatusBarItem;

    constructor(private documentDatabase: DocumentDatabase) {
        let subscriptions: Disposable[] = [];

        this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
        subscriptions.push(this.statusBarItem);

        subscriptions.push(window.onDidChangeActiveTextEditor(e => this.update()));
        subscriptions.push(window.onDidChangeTextEditorViewColumn(e => this.update()));
        subscriptions.push(workspace.onDidOpenTextDocument(e => this.update()));
        subscriptions.push(workspace.onDidCloseTextDocument(e => this.update()));

        this.disposable = Disposable.from(...subscriptions);
    }

    update() {
        let doc = getEditorSqlDocument();
        if (doc) {
            let db = this.documentDatabase.get(doc);
            if (db) {
                this.statusBarItem.tooltip = `SQlite Database: ${db}`;
                this.statusBarItem.text = `SQLite Database: ${basename(db)}`;
                this.statusBarItem.show();
            } else {
                this.statusBarItem.hide();
            }
        } else {
            this.statusBarItem.hide();
        }
    }

    dispose() {
        this.disposable.dispose();
    }
}