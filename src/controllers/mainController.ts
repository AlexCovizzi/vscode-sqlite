'use strict';

import { DatabaseStore } from '../database/databaseStore';
import { getSqlitePath } from '../utils/utils';
import { Uri, commands, ExtensionContext, Disposable } from 'vscode';
import { SQLiteExplorer } from '../explorer/explorer';
import { DBItem, TableItem } from '../explorer/treeItem';
import { Commands } from '../constants/constants';
import { SQLRunner } from './sqlRunner';

/**
 * Initialize controllers and register commands
 */
export class MainController implements Disposable {

    private databaseStore!: DatabaseStore;
    private explorer!: SQLiteExplorer;
    private sqlRunner!: SQLRunner;

    constructor(private context: ExtensionContext) {

    }

    dispose() {
        this.deactivate();
    }

    activate(): Promise<boolean> {
        /* register database commands */
        this.context.subscriptions.push(commands.registerCommand(Commands.openDatabase, (dbUri: Uri) => {
            this.onOpenDatabase(dbUri.fsPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.closeDatabase, (dbItem: DBItem) => {
            this.onCloseDatabase(dbItem.dbPath);
        }));
        // register explorer commands
        this.context.subscriptions.push(commands.registerCommand(Commands.addToExplorer, (dbPath: string) => {
            this.onAddToExplorer(dbPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.removeFromExplorer, (dbPath: string) => {
            this.onRemoveFromExplorer(dbPath);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.refreshExplorer, () => {
            this.onRefreshExplorer();
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runSql, (dbPath: string, sqlScript: string) => {
            this.onRunSql(dbPath, sqlScript);
        }));
        this.context.subscriptions.push(commands.registerCommand(Commands.runTableQuery, (tableItem: TableItem) => {
            this.onRunTableQuery(tableItem.parent.dbPath, tableItem.label);
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
            this.sqlRunner = new SQLRunner(this.databaseStore);
    
            self.context.subscriptions.push(this.databaseStore);
            self.context.subscriptions.push(this.explorer);
            self.context.subscriptions.push(this.sqlRunner);

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

    private onAddToExplorer(dbPath: string) {
        this.explorer.addToExplorer(dbPath);
    }

    private onRemoveFromExplorer(dbPath: string) {
        this.explorer.removeFromExplorer(dbPath);
    }

    private onRefreshExplorer() {
        this.explorer.refreshExplorer();
    }

    private onRunSql(dbPath: string, sqlScript: string) {
        this.sqlRunner.runSql(dbPath, sqlScript);
    }

    private onRunTableQuery(dbPath: string, tableName: string) {
        commands.executeCommand(Commands.runSql, dbPath, `SELECT * FROM ${tableName} LIMIT 500;`);
    }
}

