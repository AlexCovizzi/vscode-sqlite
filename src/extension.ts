'use strict';

import { ExtensionContext, commands, Uri, TextDocument, workspace } from 'vscode';
import { pickListDatabase, pickWorkspaceDatabase, showQueryInputBox, createSqlDocument, getEditorSqlDocument, getEditorSelection, showErrorMessage } from './vscodewrapper';
import { logger } from './logging/logger';
import { getConfiguration, Configuration } from './configuration';
import { Constants } from './constants/constants';
import SqlWorkspace from './sqlworkspace';
import SQLite from './sqlite';
import Explorer from './explorer';
import ResultView from './resultview';
import LanguageServer from './languageserver';

export namespace Commands {
    export const showOutputChannel = "sqlite.showOutputChannel";
    export const runDocumentQuery = "sqlite.runDocumentQuery";
    export const useDatabase: string = 'sqlite.useDatabase';
    export const explorerAdd: string = 'sqlite.explorer.add';
    export const explorerRemove: string = 'sqlite.explorer.remove';
    export const explorerRefresh: string = 'sqlite.explorer.refresh';
    export const newQuery: string = 'sqlite.newQuery';
    export const quickQuery: string = 'sqlite.quickQuery';
    export const runTableQuery: string = 'sqlite.runTableQuery';
    export const runSqliteMasterQuery: string = 'sqlite.runSqliteMasterQuery';
}

let configuration: Configuration;
let languageserver: LanguageServer;
let sqlWorkspace: SqlWorkspace;
let sqlite: SQLite;
let explorer: Explorer;
let resultView: ResultView;

export function activate(context: ExtensionContext): Promise<boolean> {
    
    logger.info(`Activating extension ${Constants.extensionName} v${Constants.extensionVersion}...`);

    // load configuration and reload every time it's changed
    configuration = getConfiguration();
    
    context.subscriptions.push(workspace.onDidChangeConfiguration(() => {
        configuration = getConfiguration();
    }));

    // initialize modules
    languageserver = new LanguageServer();
    sqlWorkspace = new SqlWorkspace();
    sqlite = new SQLite(context.extensionPath);
    explorer = new Explorer();
    resultView = new ResultView(context.extensionPath);

    languageserver.setSchemaHandler(doc => {
        let dbPath = sqlWorkspace.getDocumentDatabase(doc);
        if (dbPath) return sqlite.schema(configuration.sqlite3, dbPath);
        else return Promise.resolve();
    });

    context.subscriptions.push(languageserver, sqlWorkspace, sqlite, explorer, resultView);
    
    // register commands
    context.subscriptions.push(commands.registerCommand(Commands.showOutputChannel, () => {
        logger.showOutput();
    }));

    context.subscriptions.push(commands.registerCommand(Commands.runDocumentQuery, () => {
        return runDocumentQuery();
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.explorerAdd, (dbUri?: Uri) => {
        let dbPath = dbUri? dbUri.fsPath : dbUri;
        return explorerAdd(dbPath);
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.explorerRemove, (db?: {path: string}) => {
        let dbPath = db? db.path : db;
        return explorerRemove(dbPath);
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.explorerRefresh, () => {
        return explorerRefresh();
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
    
    context.subscriptions.push(commands.registerCommand(Commands.runTableQuery, (table: {database: string, name: string}) => {
        return runTableQuery(table.database, table.name);
    }));
    
    context.subscriptions.push(commands.registerCommand(Commands.runSqliteMasterQuery, (db: {path: string}) => {
        return runSqliteMasterQuery(db.path);
    }));

    logger.info(`Extension activated.`);
    return Promise.resolve(true);
}


function runDocumentQuery() {
    let sqlDocument = getEditorSqlDocument();
    if (sqlDocument) {
        let dbPath = sqlWorkspace.getDocumentDatabase(sqlDocument);
        if (dbPath) {
            let selection = getEditorSelection();
            let query = sqlDocument.getText(selection);
            runQuery(dbPath, query, true);
        } else {
            useDatabase().then(dbPath => {
                if (dbPath) runDocumentQuery();
            });
        }
    }
}

function quickQuery() {
    pickWorkspaceDatabase(false, true).then(dbPath => {
        if (dbPath) {
            showQueryInputBox(dbPath).then(query => {
                if (query) runQuery(dbPath, query, true);
            });
        }
    });
}

function useDatabase(): Thenable<string> {
    let sqlDocument = getEditorSqlDocument();
    return pickWorkspaceDatabase(false, true).then(dbPath => {
        if (sqlDocument && dbPath) sqlWorkspace.bindDatabaseToDocument(dbPath, sqlDocument);
        return Promise.resolve(dbPath);
    });
}

function explorerAdd(dbPath?: string): Thenable<void> {
    if (dbPath) {
        return sqlite.schema(configuration.sqlite3, dbPath).then(schema => {
            return explorer.add(schema);
        });
    } else {
        return pickWorkspaceDatabase(false, false).then(
            dbPath => {
                if (dbPath) return explorerAdd(dbPath);
            },
            onrejected => {
                // fail silently
            }
        );
    }
}

function explorerRemove(dbPath?: string): Thenable<void> {
    if (dbPath) {
        return Promise.resolve(explorer.remove(dbPath));
    } else {
        let dbList = explorer.list().map(db => db.path);
        return pickListDatabase(false, dbList).then(
            dbPath => {
                if (dbPath) return explorerRemove(dbPath);
            },
            onrejected => {
                // fail silently
            }
        );
    }
}

function explorerRefresh() {
    let dbList = explorer.list();
    dbList.forEach(db => {
        let dbPath = db.path;
        sqlite.schema(configuration.sqlite3, dbPath).then(schema => {
            explorer.add(schema);
        });
    });
}

function newQuery(dbPath?: string): Thenable<TextDocument> {
    return createSqlDocument(true).then(sqlDocument => {
        if (dbPath) sqlWorkspace.bindDatabaseToDocument(dbPath, sqlDocument);
        return Promise.resolve(sqlDocument);
    });
}

function runTableQuery(dbPath: string, tableName: string) {
    let query = `SELECT * FROM \`${tableName}\`;`;
    runQuery(dbPath, query, true);
}

function runSqliteMasterQuery(dbPath: string) {
    let query = `SELECT * FROM sqlite_master;`;
    runQuery(dbPath, query, true);
}

function runQuery(dbPath: string, query: string, display: boolean) {
    let resultSet = sqlite.query(configuration.sqlite3, dbPath, query).then(({resultSet, error}) => {
        // log and show if there is any error
        if (error) {
            logger.error(error.message);
            showErrorMessage(error.message, {title: "Show output", command: Commands.showOutputChannel});
        }

        return resultSet;
    });

    if (display) {
        resultView.display(resultSet, configuration.recordsPerPage);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    
}