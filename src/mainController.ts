'use strict';

import { Uri, commands, ExtensionContext, Disposable, window } from 'vscode';
import { DatabaseStore } from './database/databaseStore';
import { getSqlitePath } from './utils/utils';
import { SQLiteExplorer } from './explorer/explorer';
import { DBItem, TableItem } from './explorer/treeItem';
import { Commands } from './constants/constants';
import { QueryRunner } from './queryRunner/queryRunner';
import { ResultView, WebviewPanelController } from './resultView/resultView';
import { ResultSet } from './database/resultSet';
import * as Prompts from './prompts/prompts';
import { getEditorSqlDocument, newSqlDocument } from './sqlDocument/sqlDocument';
import { DatabaseBindings } from './sqlDocument/databaseBindings';
import { existsSync } from 'fs';

/**
 * Initialize controllers, register commands, run commands
 */
export class MainController implements Disposable {
    private activated: boolean;

    private databaseStore!: DatabaseStore;
    private explorer!: SQLiteExplorer;
    private queryRunner!: QueryRunner;
    private resultView!: ResultView;
    private databaseBindings: DatabaseBindings = new DatabaseBindings();

    constructor(private context: ExtensionContext) {
        this.activated = true;
    }

    dispose() {
        this.deactivate();
    }

    activate(): Promise<boolean> {
        /**
         * OpenDatabase can be called from:
         * - the file explorer (arg is a Uri), or
         * - the command palette (arg is undefined)
         */
        this.context.subscriptions.push(commands.registerCommand(Commands.openDatabase, (arg?: Uri) => {
            this.onOpenDatabase(arg instanceof Uri? arg.fsPath : arg);
        }));
        /**
         * CloseDatabase can be called from:
         * - the sqlite explorer (arg is a DBItem), or
         * - the command palette (arg is undefined)
         */ 
        this.context.subscriptions.push(commands.registerCommand(Commands.closeDatabase, (arg?: DBItem) => {
            this.onCloseDatabase(arg instanceof DBItem? arg.dbPath : arg);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.bindDatabase, () => {
            this.onBindDatabase();
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
        this.context.subscriptions.push(commands.registerCommand(Commands.runSqliteMasterQuery, (dbItem: DBItem) => {
            this.onRunSqliteMasterQuery(dbItem.dbPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runDocumentQuery, (docUri: Uri) => {
            this.onRunDocumentQuery();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showQueryResult, (resultSet: ResultSet) => {
            this.onShowQueryResult(resultSet);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.newQuery, (arg?: DBItem) => {
            this.onNewQuery(arg instanceof DBItem? arg.dbPath : arg);
        }));

        return this.initialize();
    }

    deactivate() {
        this.activated = false;
        // nothing to deactivate for now
    }

    private initialize(): Promise<boolean> {
        let self = this;

        return new Promise( (resolve, reject) => {
            const extensionPath = self.context.extensionPath;
            
            let sqlitePath = getSqlitePath(extensionPath);
            if (!existsSync(sqlitePath)) {
                this.activated = false;
                
                window.showErrorMessage(`Failed to activate extension. SQLite binaries not found.`);
                
                resolve(false);
                return;
            }

            /* initialize DatabaseStore, Explorer, QueryRunner, ResultView */
            this.databaseStore = new DatabaseStore(sqlitePath);
            this.explorer = new SQLiteExplorer(this.databaseStore);
            this.queryRunner = new QueryRunner(this.databaseStore);
            this.resultView = new WebviewPanelController();

    
            self.context.subscriptions.push(this.databaseStore);
            self.context.subscriptions.push(this.explorer);
            self.context.subscriptions.push(this.queryRunner);
            self.context.subscriptions.push(this.resultView);

            this.activated = true;

            resolve(true);
        });
    }

    /**
     * Opens the database passed as parameter.
     * If dbPath is undefined it will open a QuickPick that let you
     * choose a database to open from the files with extension .db or .sqlite in your workspace,
     * and then recalls this method with the chosen file path as parameter.
     */
    private onOpenDatabase(dbPath?: string) {
        if (dbPath) {
            let database = this.databaseStore.openDatabase(dbPath);
            if (database) {
                commands.executeCommand(Commands.addToExplorer, dbPath);
            }
        } else {
            Prompts.searchDatabase().then(
                path => this.onOpenDatabase(path)
            );
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
            this.databaseBindings.unbind(dbPath);
            commands.executeCommand(Commands.removeFromExplorer, dbPath);
        } else {
            Prompts.chooseDatabase(this.databaseStore).then(
                path => this.onCloseDatabase(path)
            );
        }
    }

    private onBindDatabase(): Thenable<String> {
        return new Promise((resolve, reject) => {
            let hint = 'Choose a database to bind to this document';
            Prompts.chooseDatabase(this.databaseStore, hint, true).then((dbPath) => {
                this.onOpenDatabase(dbPath); // if the database is already open this wont do anything
                this.databaseBindings.bind(getEditorSqlDocument(), dbPath);
                resolve(dbPath);
            });
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
            err => { window.showErrorMessage(err); }
        );
    }

    private onRunTableQuery(dbPath: string, tableName: string) {
        let query = `SELECT * FROM ${tableName} LIMIT 500;`;
        commands.executeCommand(Commands.runQuery, dbPath, query);
    }

    private onRunSqliteMasterQuery(dbPath: string) {
        let query = `SELECT * FROM sqlite_master;`;
        commands.executeCommand(Commands.runQuery, dbPath, query);
    }

    private onNewQuery(dbPath?: string) {
        newSqlDocument(true).then(
            doc => {
                if (dbPath) {
                    this.databaseBindings.bind(doc, dbPath);
                }
            }
        );
    }

    private onRunDocumentQuery() {
        let doc = getEditorSqlDocument();
        if (doc) {
            let text = doc.getText();
            let dbPath = this.databaseBindings.get(doc);
            if (dbPath) {
                commands.executeCommand(Commands.runQuery, dbPath, text);
            } else {
                this.onBindDatabase().then(dbPath => {
                    commands.executeCommand(Commands.runQuery, dbPath, text);
                });
            }
        }
    }

    private onShowQueryResult(resultSet: ResultSet) {
        this.resultView.show(resultSet);
    }
}

