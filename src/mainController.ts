'use strict';

import { Uri, commands, ExtensionContext, window, Disposable } from 'vscode';
import { SQLiteExplorer } from './explorer/explorer';
import { DBItem, TableItem } from './explorer/treeItem';
import { Commands, Constants } from './constants/constants';
import { QueryRunner } from './database/queryRunner';
import { ResultView, WebviewPanelController } from './resultView/resultView';
import { ResultSet } from './database/resultSet';
import { pickWorkspaceDatabase, pickListDatabase } from './prompts/quickpick';
import { showQueryInputBox } from './prompts/inputbox';
import { getEditorSqlDocument, newSqlDocument } from './sqlDocument/sqlDocument';
import { DocumentDatabase } from './sqlDocument/documentDatabase';
import { logger } from './logging/logger';
import { DocumentDatabaseStatusBar } from './statusBar/docDatabaseStatusBar';
import { Configuration } from './configuration/configuration';

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
        this.context.subscriptions.push(commands.registerCommand(Commands.quickQuery, () => {
            this.onCommandEvent(() => this.onQuickQuery());
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
            this.configuration = new Configuration(this.context.extensionPath);
            this.queryRunner = new QueryRunner(this.configuration);
            this.explorer = new SQLiteExplorer(this.queryRunner);
            this.documentDatabase = new DocumentDatabase();
            this.documentDatabaseStatusBar = new DocumentDatabaseStatusBar(this.documentDatabase);
            this.resultView = new WebviewPanelController();

            self.context.subscriptions.push(this.configuration);
            self.context.subscriptions.push(this.explorer);
            self.context.subscriptions.push(this.queryRunner);
            self.context.subscriptions.push(this.resultView);
            self.context.subscriptions.push(this.documentDatabase);
            self.context.subscriptions.push(this.documentDatabaseStatusBar);

            logger.setConfiguration(this.configuration);
            
            logger.info('Extension activated!');

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
        pickWorkspaceDatabase(this.configuration.autopick, hint).then(
            path => this.explorer.addToExplorer(path)
        );
    }

    private onCloseExplorerDatabase() {
        pickListDatabase(this.explorer.getDatabases(), this.configuration.autopick).then(
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
            pickWorkspaceDatabase(this.configuration.autopick, hint).then((dbPath) => {
                let doc = getEditorSqlDocument();
                if (doc) {
                    this.documentDatabase.bind(doc, dbPath);
                    this.documentDatabaseStatusBar.update();
                    logger.info(`Document '${doc? doc.uri.fsPath : ''}' uses '${dbPath}'`);
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

    private onQuickQuery() {
        pickWorkspaceDatabase(this.configuration.autopick).then(dbPath => {
            showQueryInputBox(dbPath).then(query => {
                if (query) {
                    commands.executeCommand(Commands.runQuery, dbPath, query);
                }
            });
        });
    }

    private onRunTableQuery(dbPath: string, tableName: string) {
        let limit = this.configuration.showTableLimit >= 0? `LIMIT ${this.configuration.showTableLimit}` : ``;
        let query = `SELECT * FROM ${tableName} ${limit};`;
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

}

