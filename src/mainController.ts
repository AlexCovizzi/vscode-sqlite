'use strict';

import { Uri, commands, ExtensionContext, Disposable, window, workspace, ViewColumn } from 'vscode';
import { DatabaseStore } from './database/databaseStore';
import { getSqlitePath } from './utils/utils';
import { SQLiteExplorer } from './explorer/explorer';
import { DBItem, TableItem } from './explorer/treeItem';
import { Commands } from './constants/constants';
import { QueryRunner } from './queryRunner/queryRunner';
import { WebviewPanelController } from './view/webviewController';
import { ResultSet } from './database/resultSet';
import * as Prompts from './prompts/prompts';

/**
 * Initialize controllers, register commands, run commands
 */
export class MainController implements Disposable {

    private databaseStore!: DatabaseStore;
    private explorer!: SQLiteExplorer;
    private queryRunner!: QueryRunner;
    private webviewController!: WebviewPanelController;

    constructor(private context: ExtensionContext) {

    }

    dispose() {
        this.deactivate();
    }

    activate(): Promise<boolean> {
        /**
         * OpenDatabase can be called:
         * from the file explorer (arg is a Uri), or
         * from the command palette (arg is undefined)
         */
        this.context.subscriptions.push(commands.registerCommand(Commands.openDatabase, (arg?: Uri) => {
            this.onOpenDatabase(arg instanceof Uri? arg.fsPath : arg);
        }));
        /**
         * CloseDatabase can be called:
         * from the sqlite explorer (arg is a DBItem), or
         * from the command palette (arg is undefined)
         */ 
        this.context.subscriptions.push(commands.registerCommand(Commands.closeDatabase, (arg?: DBItem) => {
            this.onCloseDatabase(arg instanceof DBItem? arg.dbPath : arg);
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
        this.context.subscriptions.push(commands.registerCommand(Commands.newQuery, () => {
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

    /**
     * Opens the database passed as parameter.
     * If dbPath is undefined it will open a QuickPick that let you
     * choose a database to open from the files with extension .db or .sqlite
     * found in your workspace, and then recalls this method with the chosen file path as parameter.
     */
    private onOpenDatabase(dbPath?: string) {
        if (dbPath) {
            let database = this.databaseStore.openDatabase(dbPath);
            if (database) {
                commands.executeCommand(Commands.addToExplorer, dbPath);
            }
        } else {
            Prompts.searchDatabase((path: string) => {
                this.onOpenDatabase(path);
            });
        }
    }

    /**
     * Close the database passed as parameter.
     * If dbPath is undefined it will open a QuickPick that let you
     * choose which database to close and then recalls this method
     * with the chosen database path as parameter.
     */
    private onCloseDatabase(dbPath?: string) {
        if (dbPath) {
            this.databaseStore.closeDatabase(dbPath);
            commands.executeCommand(Commands.removeFromExplorer, dbPath);
        } else {
            Prompts.chooseDatabase(this.databaseStore, (path: string) => {
                this.onCloseDatabase(path);
            });
        }
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
            err => { window.showErrorMessage(err); }
        );
    }

    private onRunTableQuery(dbPath: string, tableName: string) {
        commands.executeCommand(Commands.runQuery, dbPath, `SELECT * FROM ${tableName} LIMIT 500;`);
    }

    private onNewQuery() {
        workspace.openTextDocument({language: 'sql'}).then(
            doc => window.showTextDocument(doc, ViewColumn.One)
        );
    }

    private onRunDocumentQuery() {
        let editor = window.activeTextEditor;
        if (editor) {
            let text = editor.document.getText();
            let nDbsOpen = this.databaseStore.getAll().length;
            if (nDbsOpen === 0) {
                Prompts.searchDatabase((path: string) => {
                    this.onOpenDatabase(path);
                    if (path) {
                        commands.executeCommand(Commands.runQuery, path, text);
                    }
                });
            } else if (nDbsOpen === 1) {
                let dbPath = this.databaseStore.getAll()[0].dbPath;
                commands.executeCommand(Commands.runQuery, dbPath, text);
            } else if (nDbsOpen > 1) {
                Prompts.chooseDatabase(this.databaseStore, (path: string) => {
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

