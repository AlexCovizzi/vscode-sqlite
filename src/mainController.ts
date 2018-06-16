'use strict';

import { Uri, commands, ExtensionContext, Disposable, window } from 'vscode';
import { getSqliteBinariesPath } from './utils/utils';
import { SQLiteExplorer } from './explorer/explorer';
import { DBItem, TableItem } from './explorer/treeItem';
import { Commands, Constants } from './constants/constants';
import { QueryRunner } from './database/queryRunner';
import { ResultView, WebviewPanelController } from './resultView/resultView';
import { ResultSet } from './database/resultSet';
import * as Prompts from './prompts/prompts';
import { getEditorSqlDocument, newSqlDocument } from './sqlDocument/sqlDocument';
import { DatabaseBindings } from './sqlDocument/databaseBindings';
import { Configuration } from './configurations/configurations';
import { OutputLogger, DebugLogger } from './logging/logger';
import { execSync } from 'child_process';
import * as commandExists from 'command-exists';

/**
 * Initialize controllers, register commands, run commands
 */
export class MainController {
    private queryRunner!: QueryRunner;
    private explorer!: SQLiteExplorer;
    private resultView!: ResultView;
    private databaseBindings!: DatabaseBindings;

    constructor(private context: ExtensionContext) {
        
    }

    activate(): Promise<boolean> {
        this.context.subscriptions.push(commands.registerCommand(Commands.exploreDatabase, (uri: Uri) => {
            this.onExploreDatabase(uri.fsPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.closeExplorerDatabase, (item: DBItem) => {
            this.onCloseExplorerDatabase(item.dbPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.bindDatabase, () => {
            this.onBindDatabase();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runDocumentQuery, () => {
            this.onRunDocumentQuery();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.newQuery, (item?: DBItem) => {
            this.onNewQuery(item? item.dbPath : undefined);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.refreshExplorer, () => {
            this.onRefreshExplorer();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runTableQuery, (tableItem: TableItem) => {
            this.onRunTableQuery(tableItem.parent.dbPath, tableItem.label);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runSqliteMasterQuery, (dbItem: DBItem) => {
            this.onRunSqliteMasterQuery(dbItem.dbPath);
        }));
        // private commands
        this.context.subscriptions.push(commands.registerCommand(Commands.runQuery, (dbPath: string, query: string) => {
            this.onRunQuery(dbPath, query);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showQueryResult, (resultSet: ResultSet) => {
            this.onShowQueryResult(resultSet);
        }));

        return this.initialize();
    }

    private initialize(): Promise<boolean> {
        let self = this;

        return new Promise( (resolve, reject) => {
            let cmdSqlite = this.getCmdSqlite();
            if (!cmdSqlite) {
                OutputLogger.log('Failed to activate extension.');
                window.showErrorMessage(`Failed to activate ${Constants.extensionName} extension`);
                resolve(false);
                return;
            }

            this.queryRunner = new QueryRunner(cmdSqlite);
            this.explorer = new SQLiteExplorer(this.queryRunner);
            this.databaseBindings = new DatabaseBindings();
            this.resultView = new WebviewPanelController();

            self.context.subscriptions.push(this.explorer);
            self.context.subscriptions.push(this.queryRunner);
            self.context.subscriptions.push(this.resultView);
            
            OutputLogger.log('Extension activated!');

            resolve(true);
        });
    }

    /* Commands events */

    private onExploreDatabase(dbPath: string) {
        this.explorer.addToExplorer(dbPath);
    }

    private onCloseExplorerDatabase(dbPath: string) {
        this.explorer.removeFromExplorer(dbPath);
    }

    private onBindDatabase(): Thenable<String> {
        return new Promise((resolve, reject) => {
            let hint = 'Choose a database to bind to this document';
            Prompts.searchDatabase(hint).then((dbPath) => {
                this.databaseBindings.bind(getEditorSqlDocument(), dbPath);
                resolve(dbPath);
            });
        });
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
    

    private getCmdSqlite(): string | undefined {
        let cmdSqlite = Configuration.sqlite3();
        if (!commandExists.sync(cmdSqlite) || cmdSqlite.trim() === '') {
            OutputLogger.log(`'${cmdSqlite}' is not recognized as a command.`);
            // fallback to sqlite3 binaries in {extension}/bin
            return this.sqliteBinariesFallback();
        }
        
        if (!this.isCmdSqliteValid(cmdSqlite)) {
            OutputLogger.log(`'${cmdSqlite}' is not a valid command.`);
            // fallback to sqlite3 binaries in {extension}/bin
            return this.sqliteBinariesFallback();
        }

        return cmdSqlite;
    }

    private sqliteBinariesFallback(): string | undefined {
        let binPath = getSqliteBinariesPath(this.context.extensionPath);
        if (binPath === '') {
            OutputLogger.log(`Fallback binaries not found.`);
            return undefined;
        } else {
            OutputLogger.log(`Falling back to binaries '${binPath}'...`);
        }

        if (!this.isCmdSqliteValid(binPath)) {
            OutputLogger.log(`Invalid binaries '${binPath}'.`);
            return undefined;
        } else {
            return binPath;
        }
    }

    private isCmdSqliteValid(cmdSqlite: string) {
        try {
            let out = execSync(`${cmdSqlite} -version`).toString();
            // out must be: {version at least 3} {date} {time} {hex string (the length varies)}
            if (out.match(/3\.[0-9]{1,2}\.[0-9]{1,2} [0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}\:[0-9]{2}\:[0-9]{2} [a-f0-9]{0,90}/)) {
                return true;
            }
        } catch(e) {
            //
        }
        return false;
    }
}

