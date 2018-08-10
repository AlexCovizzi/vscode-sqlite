'use strict';

import { Uri, commands, ExtensionContext, window, Disposable, workspace, ViewColumn } from 'vscode';
import { SQLiteExplorer } from './explorer/explorer';
import { Commands, Constants } from './constants/constants';
import { QueryRunner } from './database/queryRunner';
import { ResultView } from './resultView/resultView';
import { ResultSet } from './database/resultSet';
import { pickWorkspaceDatabase, pickListDatabase } from './prompts/quickpick';
import { showQueryInputBox } from './prompts/inputbox';
import { getEditorSqlDocument, newSqlDocument } from './sqlDocument/sqlDocument';
import { DocumentDatabase } from './sqlDocument/documentDatabase';
import { logger } from './logging/logger';
import { DocumentDatabaseStatusBar } from './statusBar/docDatabaseStatusBar';
import { Configuration } from './configuration/configuration';
import { TableInfo, DatabaseInfo } from './database/databaseInfo';

/**
 * Initialize controllers, register commands, run commands
 */
export class MainController implements Disposable {
    private activated = false;

    private configuration!: Configuration;
    private queryRunner!: QueryRunner;
    private explorer!: SQLiteExplorer;
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
        this.context.subscriptions.push(commands.registerCommand(Commands.ctxCloseExplorerDatabase, (dbInfo: DatabaseInfo) => {
            this.onCommandEvent(() => this.onCtxCloseExplorerDatabase(dbInfo.dbPath));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.useDatabase, () => {
            this.onCommandEvent(() => this.onUseDatabase());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runDocumentQuery, () => {
            this.onCommandEvent(() => this.onRunDocumentQuery());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.newQuery, (dbInfo?: DatabaseInfo) => {
            this.onCommandEvent(() => this.onNewQuery(dbInfo? dbInfo.dbPath : undefined));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.quickQuery, () => {
            this.onCommandEvent(() => this.onQuickQuery());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.refreshExplorer, () => {
            this.onCommandEvent(() => this.onRefreshExplorer());
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runTableQuery, (tableInfo: TableInfo) => {
            this.onCommandEvent(() => this.onRunTableQuery(tableInfo.dbPath, tableInfo.name));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runSqliteMasterQuery, (dbInfo: DatabaseInfo) => {
            this.onCommandEvent(() => this.onRunSqliteMasterQuery(dbInfo.dbPath));
        }));
        // private commands
        this.context.subscriptions.push(commands.registerCommand(Commands.runQuery, (dbPath: string, query: string) => {
            this.onCommandEvent(() => this.onRunQuery(dbPath, query));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showQueryResult, (resultSet: ResultSet) => {
            this.onCommandEvent(() => this.onShowQueryResult(resultSet));
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.showAndSaveNewFile, (language: string, content: string) => {
            this.onCommandEvent(() => this.onShowAndSaveNewFile(language, content));
        }));

        return this.initialize();
    }

    deactivate() {
        this.activated = false;
    }

    private initialize(): Promise<boolean> {
        let self = this;

        return new Promise( (resolve, reject) => {
            this.configuration = new Configuration(this.context.extensionPath);
            this.queryRunner = new QueryRunner(this.configuration.sqlite3, this.configuration.outputBuffer);
            this.explorer = new SQLiteExplorer(this.queryRunner);
            this.documentDatabase = new DocumentDatabase();
            this.documentDatabaseStatusBar = new DocumentDatabaseStatusBar(this.documentDatabase);
            this.resultView = new ResultView(this.context.extensionPath);

            self.context.subscriptions.push(this.configuration);
            self.context.subscriptions.push(this.explorer);
            self.context.subscriptions.push(this.queryRunner);
            self.context.subscriptions.push(this.resultView);
            self.context.subscriptions.push(this.documentDatabase);
            self.context.subscriptions.push(this.documentDatabaseStatusBar);

            logger.setLogLevel(this.configuration.logLevel);
            
            logger.info('Extension activated!');

            this.activated = true;
            resolve(true);
        });
    }


    private onCommandEvent(fn: any) {
        if (!this.activated) {
            window.showErrorMessage(`${Constants.extensionName} extension is not activated`);
        } else {
            fn();
        }
    }

    /* Commands events */

    private onExploreDatabase() {
        let hint = 'Choose a database to open in the explorer';
        pickWorkspaceDatabase(this.configuration.autopick.get(), hint).then(
            path => this.explorer.addToExplorer(path)
        );
    }

    private onCloseExplorerDatabase() {
        pickListDatabase(this.configuration.autopick.get(), this.explorer.getDatabases()).then(
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
            pickWorkspaceDatabase(this.configuration.autopick.get(), hint).then((dbPath) => {
                let doc = getEditorSqlDocument();
                if (doc) {
                    this.documentDatabase.bind(doc, dbPath);
                    this.documentDatabaseStatusBar.update();
                    logger.info(`'${doc? doc.uri.fsPath : ''}' => '${dbPath}'`);
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
            resultSet => { 
                commands.executeCommand(Commands.showQueryResult, resultSet); 
            },
            err => {
                logger.error(err);
                window.showErrorMessage(err);
            }
        );
    }

    private onQuickQuery() {
        pickWorkspaceDatabase(this.configuration.autopick.get()).then(dbPath => {
            showQueryInputBox(dbPath).then(query => {
                if (query) {
                    commands.executeCommand(Commands.runQuery, dbPath, query);
                }
            });
        });
    }

    private onRunTableQuery(dbPath: string, tableName: string) {
        let query = `SELECT * FROM ${tableName};`;
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
        this.resultView.show(resultSet, this.configuration.recordsPerPage.get());
    }

    private onShowAndSaveNewFile(language: string, content: string) {
        workspace.openTextDocument({language: language, content: content}).then(
            doc => {
                window.showTextDocument(doc, ViewColumn.One).then(() => {
                    commands.executeCommand('workbench.action.files.saveAs');
                });
            },
            err => console.log(err)
        );
    }
}

