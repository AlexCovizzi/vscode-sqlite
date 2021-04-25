import { Schema } from "./schema";
import { Disposable } from "vscode";
import { ResultSet } from "../common";
import { executeQuery, QueryExecutionOptions } from "./queryExecutor";
import { validateSqliteCommand } from "./sqliteCommandValidation";
import { logger } from "../logging/logger";
import { showErrorMessage } from "../vscodewrapper";
import { Commands } from "../commands";

// TODO: Improve how the sqlite command is set
class SQLite implements Disposable {

    private extensionPath: string;
    private sqliteCommand!: string;

    constructor(extensionPath: string, sqliteCommand: string) {
        this.extensionPath = extensionPath;
        this.setSqliteCommand(sqliteCommand);
    }

    query(dbPath: string, query: string, options?: QueryExecutionOptions): Promise<QueryResult> {
        if (!this.sqliteCommand) Promise.resolve({error: "Unable to execute query: provide a valid sqlite3 executable in the setting sqlite.sqlite3."});

        return executeQuery(this.sqliteCommand, dbPath, query, options);
    }
    
    schema(dbPath: string): Promise<Schema.Database> {
        if (!this.sqliteCommand) Promise.resolve({error: "Unable to execute query: provide a valid sqlite3 executable in the setting sqlite.sqlite3."});

        return Promise.resolve(Schema.build(dbPath, this.sqliteCommand));
    }

    dispose() {
        // Nothing to dispose
    }

    setSqliteCommand(sqliteCommand: string) {
        try {
            this.sqliteCommand = validateSqliteCommand(sqliteCommand, this.extensionPath);
        } catch(e) {
            logger.error(e.message);
            showErrorMessage(e.message, {title: "Show output", command: Commands.showOutputChannel});
            this.sqliteCommand = "";
        }
    }
}

export interface QueryResult {resultSet?: ResultSet; error?: Error; }

export default SQLite;