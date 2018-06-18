'use strict';

import { Uri, commands, ExtensionContext, window, Disposable } from 'vscode';
import { getSqliteBinariesPath } from './utils/utils';
import { DBExplorer } from './explorer/explorer';
import { DBItem, TableItem } from './explorer/treeItem';
import { Commands, Constants } from './constants/constants';
import { QueryRunner } from './database/queryRunner';
import { ResultView, WebviewPanelController } from './resultView/resultView';
import { ResultSet } from './database/resultSet';
import * as Prompts from './prompts/prompts';
import { getEditorSqlDocument, newSqlDocument } from './sqlDocument/sqlDocument';
import { DocumentDatabase } from './sqlDocument/documentDatabase';
import { Configuration } from './configurations/configurations';
import { OutputLogger, DebugLogger } from './logging/logger';
import { execSync } from 'child_process';
import * as commandExists from 'command-exists';
import { DocumentDatabaseStatusBar } from './statusBar/docDatabaseStatusBar';

/**
 * Initialize controllers, register commands, run commands
 */
export class MainController implements Disposable {
    private activated = false;

    private queryRunner!: QueryRunner;
    private explorer!: DBExplorer;
    private resultView!: ResultView;
    private documentDatabase!: DocumentDatabase;
    private documentDatabaseStatusBar!: DocumentDatabaseStatusBar;

    constructor(private context: ExtensionContext) {
        
    }

    dispose() {
        this.deactivate();
    }

    activate(): Promise<boolean> {
        this.context.subscriptions.push(commands.registerCommand(Commands.exploreDatabase, () => {
            this.onCommandEvent(() => this.onExploreDatabase());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.closeExplorerDatabase, () => {
            this.onCommandEvent(() => this.onCloseExplorerDatabase());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.ctxExploreDatabase, (uri: Uri) => {
            this.onCommandEvent(() => this.onCtxExploreDatabase(uri.fsPath));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.ctxCloseExplorerDatabase, (item: DBItem) => {
            this.onCommandEvent(() => this.onCtxCloseExplorerDatabase(item.dbPath));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.useDatabase, () => {
            this.onCommandEvent(() => this.onUseDatabase());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runDocumentQuery, () => {
            this.onCommandEvent(() => this.onRunDocumentQuery());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.newQuery, (item?: DBItem) => {
            this.onCommandEvent(() => this.onNewQuery(item? item.dbPath : undefined));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.refreshExplorer, () => {
            this.onCommandEvent(() => this.onRefreshExplorer());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runTableQuery, (tableItem: TableItem) => {
            this.onCommandEvent(() => this.onRunTableQuery(tableItem.parent.dbPath, tableItem.label));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runSqliteMasterQuery, (dbItem: DBItem) => {
            this.onCommandEvent(() => this.onRunSqliteMasterQuery(dbItem.dbPath));
        }));
        // private commands
        this.context.subscriptions.push(commands.registerCommand(Commands.runQuery, (dbPath: string, query: string) => {
            this.onCommandEvent(() => this.onRunQuery(dbPath, query));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showQueryResult, (resultSet: ResultSet) => {
            this.onCommandEvent(() => this.onShowQueryResult(resultSet));
        }));

        return this.initialize();
    }

    deactivate() {
        this.activated = false;
    }

    private initialize(): Promise<boolean> {
        let self = this;

        return new Promise( (resolve, reject) => {
            let cmdSqlite = this.getCmdSqlite();
            if (!cmdSqlite) {
                OutputLogger.log('Failed to activate extension.\n');
                window.showErrorMessage(`Failed to activate ${Constants.extensionName} extension. `+
                                        `For more informations see ${Constants.outputChannelName} output channel`);
                resolve(false);
                return;
            }

            this.queryRunner = new QueryRunner(cmdSqlite);
            this.explorer = new DBExplorer(this.queryRunner);
            this.documentDatabase = new DocumentDatabase();
            this.documentDatabaseStatusBar = new DocumentDatabaseStatusBar(this.documentDatabase);
            this.resultView = new WebviewPanelController();

            self.context.subscriptions.push(this.explorer);
            self.context.subscriptions.push(this.queryRunner);
            self.context.subscriptions.push(this.resultView);
            self.context.subscriptions.push(this.documentDatabase);
            self.context.subscriptions.push(this.documentDatabaseStatusBar);
            
            OutputLogger.log('Extension activated!\n');

            this.activated = true;
            resolve(true);
        });
    }

    private onCommandEvent(callback: any) {
        if (!this.activated) {
            window.showErrorMessage(`${Constants.extensionName} extension is not activated`);
        } else {
            callback();
        }
    }

    /* Commands events */

    private onExploreDatabase() {
        let hint = 'Choose a database to open in the explorer';
        Prompts.searchDatabase(hint).then(
            path => this.explorer.addToExplorer(path)
        );
    }

    private onCloseExplorerDatabase() {
        Prompts.pickExplorerDatabase(this.explorer).then(
            path => this.explorer.removeFromExplorer(path)
        );
    }

    private onCtxExploreDatabase(dbPath: string) {
        this.explorer.addToExplorer(dbPath);
    }

    private onCtxCloseExplorerDatabase(dbPath: string) {
        this.explorer.removeFromExplorer(dbPath);
    }

    private onUseDatabase(): Thenable<String> {
        return new Promise((resolve, reject) => {
            let hint = 'Choose which database to use for this document';
            Prompts.searchDatabase(hint).then((dbPath) => {
                let doc = getEditorSqlDocument();
                let success = this.documentDatabase.bind(doc, dbPath);
                if (success) {
                    OutputLogger.log(`Document '${doc? doc.uri.fsPath : ''}' uses '${dbPath}'`);
                }
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
                    this.documentDatabase.bind(doc, dbPath);
                }
            }
        );
    }

    private onRunDocumentQuery() {
        let doc = getEditorSqlDocument();
        if (doc) {
            let text = doc.getText();
            let dbPath = this.documentDatabase.get(doc);
            if (dbPath) {
                commands.executeCommand(Commands.runQuery, dbPath, text);
            } else {
                this.onUseDatabase().then(dbPath => {
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
            // this is to check that the command is actually for sqlite3
            if (out.match(/3\.[0-9]{1,2}\.[0-9]{1,2} [0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}\:[0-9]{2}\:[0-9]{2} [a-f0-9]{0,90}/)) {
                return true;
            }
        } catch(e) {
            return DebugLogger.error(e.message);
        }
        return false;
    }
}

