'use strict';

import { ExtensionContext, commands, Uri, TextDocument, workspace } from 'vscode';
import { pickListDatabase, pickWorkspaceDatabase, showQueryInputBox, createSqlDocument, getEditorSqlDocument, getEditorSelection } from './vscodeWrapper';
import { logger } from './logging/logger';
import { Constants } from './constants/constants';
import SqlWorkspace from './sqlworkspace';
import SQLite from './sqlite';
import Explorer from './explorer';
import ResultView from './resultview';
import getConfiguration, { Configuration } from './configuration';

namespace Commands {
    export const runDocumentQuery = "sqlite.runDocumentQuery";
    export const useDatabase: string = 'sqlite.useDatabase';
    export const exploreDatabase: string = 'sqlite.exploreDatabase';
    export const closeExplorerDatabase: string = 'sqlite.closeExplorerDatabase';
    export const newQuery: string = 'sqlite.newQuery';
    export const quickQuery: string = 'sqlite.quickQuery';
    export const refreshExplorer: string = 'sqlite.refreshExplorer';
    export const runTableQuery: string = 'sqlite.runTableQuery';
    export const runSqliteMasterQuery: string = 'sqlite.runSqliteMasterQuery';
}

let configuration: Configuration;
let sqlWorkspace: SqlWorkspace;
let sqlite: SQLite;
let explorer: Explorer;
let resultView: ResultView;

export function activate(context: ExtensionContext): Promise<boolean> {
    
    logger.info(`Activating extension ${Constants.extensionName} v${Constants.extensionVersion}...`);

    // load configuration and reload every time it's changed
    configuration = getConfiguration(context.extensionPath);
    context.subscriptions.push(workspace.onDidChangeConfiguration(() => {
        configuration = getConfiguration(context.extensionPath);
    }));

    sqlWorkspace = new SqlWorkspace();
    sqlite = new SQLite(configuration.sqlite3);
    explorer = new Explorer();
    resultView = new ResultView(context.extensionPath);

    context.subscriptions.push(sqlWorkspace, sqlite, explorer, resultView);
    
    context.subscriptions.push(commands.registerCommand(Commands.runDocumentQuery, () => {
        return runDocumentQuery();
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.exploreDatabase, (dbUri?: Uri) => {
        let dbPath = dbUri? dbUri.fsPath : dbUri;
        return exploreDatabase(dbPath);
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.closeExplorerDatabase, (db?: {path: string}) => {
        let dbPath = db? db.path : db;
        return closeExplorerDatabase(dbPath);
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.useDatabase, (dbPath: string) => {
        return useDatabase();
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.newQuery, (db?: {path: string}) => {
        let dbPath = db? db.path : db;
        return newQuery(dbPath);
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.quickQuery, () => {
        return quickQuery();
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.refreshExplorer, () => {
        return refreshExplorer();
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.runTableQuery, (table: {database: string, name: string}) => {
        return runTableQuery(table.database, table.name);
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.runSqliteMasterQuery, (db: {path: string}) => {
        return runSqliteMasterQuery(db.path);
    }));

    return Promise.resolve(true);
}

function runDocumentQuery() {
    let sqlDocument = getEditorSqlDocument();
    if (sqlDocument) {
        let dbPath = sqlWorkspace.getDocumentDatabase(sqlDocument);
        if (dbPath) {
            let selection = getEditorSelection();
            let query = sqlDocument.getText(selection);
            let resultSet = sqlite.query(dbPath, query).then(res => res.resultSet);
            resultView.display(resultSet, configuration.recordsPerPage);
        } else {
            useDatabase().then(() => {
                runDocumentQuery();
            });
        }
    }
}

function useDatabase(): Thenable<string> {
    let sqlDocument = getEditorSqlDocument();
    return pickWorkspaceDatabase(false).then(dbPath => {
        if (sqlDocument) sqlWorkspace.bindDatabaseToDocument(dbPath, sqlDocument);
        return Promise.resolve(dbPath);
    });
}

function exploreDatabase(dbPath?: string) {
    if (dbPath) {
        sqlite.schema(dbPath).then(schema => {
            explorer.add(schema);
        });
    } else {
        pickWorkspaceDatabase(false).then(dbPath => {
            exploreDatabase(dbPath);
        });
    }
}

function closeExplorerDatabase(dbPath?: string) {
    if (dbPath) {
        explorer.remove(dbPath);
    } else {
        let dbList = explorer.list().map(db => db.path);
        pickListDatabase(true, dbList).then(dbPath => {
            closeExplorerDatabase(dbPath);
        });
    }
}

function newQuery(dbPath?: string): Thenable<TextDocument> {
    return createSqlDocument(true).then(sqlDocument => {
        if (dbPath) sqlWorkspace.bindDatabaseToDocument(dbPath, sqlDocument);
        return Promise.resolve(sqlDocument);
    });
}

function quickQuery() {
    pickWorkspaceDatabase(false).then(dbPath => {
        showQueryInputBox(dbPath).then(query => {
            if (query) return sqlite.query(dbPath, query);
            else return Promise.reject('');
        }).then(res => {
            if (res.resultSet) resultView.display(Promise.resolve(res.resultSet), configuration.recordsPerPage);
        });
    });
}

function refreshExplorer() {
    let dbList = explorer.list();
    dbList.forEach(db => {
        let dbPath = db.path;
        sqlite.schema(dbPath).then(schema => {
            explorer.add(schema);
        });
    });
}

function runTableQuery(dbPath: string, tableName: string) {
    let query = `SELECT * FROM ${tableName};`;
    sqlite.query(dbPath, query).then(res => {
        if (res.resultSet) resultView.display(Promise.resolve(res.resultSet), configuration.recordsPerPage);
    });
}

function runSqliteMasterQuery(dbPath: string) {
    let query = `SELECT * FROM sqlite_master;`;
    sqlite.query(dbPath, query).then(res => {
        if (res.resultSet) resultView.display(Promise.resolve(res.resultSet), configuration.recordsPerPage);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    
}