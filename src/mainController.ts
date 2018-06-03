'use strict';

import { Uri, commands, ExtensionContext, Disposable, window } from 'vscode';
import { DatabaseStore } from './database/databaseStore';
import { getSqlitePath } from './utils/utils';
import { SQLiteExplorer } from './explorer/explorer';
import { DBItem, TableItem } from './explorer/treeItem';
import { Commands } from './constants/constants';
import { QueryRunner } from './queryRunner/queryRunner';
import { WebviewPanelController } from './webview/webviewController';
import { ResultSet } from './database/resultSet';
import * as Prompts from './prompts/prompts';
import { basename } from 'path';
import { OutputLogger } from './logging/logger';
import { DocumentBindings } from './database/documentBindings';

/**
 * Initialize controllers, register commands, run commands
 */
export class MainController implements Disposable {

    private databaseStore!: DatabaseStore;
    private explorer!: SQLiteExplorer;
    private queryRunner!: QueryRunner;
    private webviewController!: WebviewPanelController;
    private documentBindings: DocumentBindings = new DocumentBindings();

    constructor(private context: ExtensionContext) {

    }

    dispose() {
        this.deactivate();
    }

    activate(): Promise<boolean> {
        this.context.subscriptions.push(commands.registerCommand(Commands.openDatabase, (dbUri: Uri | string) => {
            this.onOpenDatabase(dbUri instanceof Uri? dbUri.fsPath : dbUri);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.closeDatabase, (dbItem: DBItem | string) => {
            this.onCloseDatabase(dbItem instanceof DBItem? dbItem.dbPath : dbItem);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showOpenDatabaseQuickPick, () => {
            this.onShowOpenDatabaseQuickPick();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showCloseDatabaseQuickPick, () => {
            this.onShowCloseDatabaseQuickPick();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showBindDatabaseQuickPick, () => {
            this.onShowBindDatabaseQuickPick();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.addToExplorer, (dbPath: string) => {
            this.onAddToExplorer(dbPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.removeFromExplorer, (dbPath: string) => {
            this.onRemoveFromExplorer(dbPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.refreshExplorer, () => {
            this.onRefreshExplorer();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runQuery, (dbPath: string, query: string) => {
            this.onRunQuery(dbPath, query);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runTableQuery, (tableItem: TableItem) => {
            this.onRunTableQuery(tableItem.parent.dbPath, tableItem.label);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runDocumentQuery, (docUri: Uri) => {
            this.onRunDocumentQuery();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showQueryResult, (resultSet: ResultSet) => {
            this.onShowQueryResult(resultSet);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.newQuery, (dbItem: DBItem) => {
            this.onNewQuery();
        }));

        return this.initialize();
    }

    deactivate() {
        // nothing to deactivate for now
    }

    private initialize(): Promise<boolean> {
        let self = this;

        return new Promise( (resolve, reject) => {
            const extensionPath = self.context.extensionPath;
    
            /* initialize DatabaseStore, Explorer */
            this.databaseStore = new DatabaseStore(getSqlitePath(extensionPath));
            this.explorer = new SQLiteExplorer(this.databaseStore);
            this.queryRunner = new QueryRunner(this.databaseStore);
            this.webviewController = new WebviewPanelController();

    
            self.context.subscriptions.push(this.databaseStore);
            self.context.subscriptions.push(this.explorer);
            self.context.subscriptions.push(this.queryRunner);
            self.context.subscriptions.push(this.webviewController);

            resolve(true);
        });
    }

    private onOpenDatabase(dbPath: string) {
        let database = this.databaseStore.openDatabase(dbPath);
        if (database) {
            commands.executeCommand(Commands.addToExplorer, dbPath);
        }
    }

    private onCloseDatabase(dbPath: string) {
        this.databaseStore.closeDatabase(dbPath);
        commands.executeCommand(Commands.removeFromExplorer, dbPath);
    }

    private onShowOpenDatabaseQuickPick() {
        Prompts.showOpenDatabaseQuickPick((path: string) => {
            commands.executeCommand(Commands.openDatabase, path);
        });
    }

    private onShowCloseDatabaseQuickPick() {
        Prompts.showCloseDatabaseQuickPick(this.databaseStore, (path: string) => {
            commands.executeCommand(Commands.closeDatabase, path);
        });
    }

    private onShowBindDatabaseQuickPick() {
        Prompts.showBindDatabaseQuickPick(this.databaseStore, (path: string) => {
            this.documentBindings.set(path);
        });
    }

    private onAddToExplorer(dbPath: string) {
        this.explorer.addToExplorer(dbPath);
    }

    private onRemoveFromExplorer(dbPath: string) {
        this.explorer.removeFromExplorer(dbPath);
    }

    private onRefreshExplorer() {
        this.explorer.refreshExplorer();
    }

    private onRunQuery(dbPath: string, query: string) {
        this.queryRunner.runQuery(dbPath, query).then(
            resultSet => { commands.executeCommand(Commands.showQueryResult, resultSet); },
            err => { /* handle error */ }
        );
    }

    private onRunTableQuery(dbPath: string, tableName: string) {
        commands.executeCommand(Commands.runQuery, dbPath, `SELECT * FROM ${tableName} LIMIT 500;`);
    }

    private onNewQuery() {
        
    }

    private onRunDocumentQuery() {
        let editor = window.activeTextEditor;
        if (editor) {
            let text = editor.document.getText();
            let documentId = editor.document.uri.fsPath;
            let dbPath = this.documentBindings.get(documentId);
            if (dbPath) {
                commands.executeCommand(Commands.runQuery, dbPath, text);
            } else {
                Prompts.showBindDatabaseQuickPick(this.databaseStore, (path: string) => {
                    this.documentBindings.set(path);
                    if (path) {
                        commands.executeCommand(Commands.runQuery, path, text);
                    }
                });
            }
        }
    }

    private onShowQueryResult(resultSet: ResultSet) {
        this.webviewController.showQueryResult(resultSet);
    }
}

