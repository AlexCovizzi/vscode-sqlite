import { Schema } from "./schema";
import { Disposable } from "vscode";
import { ResultSet } from "../common";
import { validateSqliteCommand } from "./sqliteCommandValidation";
import { executeQuery } from "./queryExecutor";

class SQLite implements Disposable {

    constructor(private extensionPath: string) {
    }

    query(sqliteCommand: string, dbPath: string, query: string): Promise<QueryResult> {
        try {
            sqliteCommand = validateSqliteCommand(sqliteCommand, this.extensionPath);
        } catch(e) {
            return Promise.resolve({error: e});
        }
        /*
        logger.info(`SQLite: '${sqliteCommand}'`);

        query = SQLParser.parse(query).join(' ');
        logger.info(`[QUERY] ${query}`);

        execute(sqliteCommand, dbPath, query, (resultSet, error) => {
            return resolve({resultSet: resultSet, error: error});
        });
        */
        return executeQuery(sqliteCommand, dbPath, query);
    }
    
    schema(sqliteCommand: string, dbPath: string): Promise<Schema.Database> {
        try {
            sqliteCommand = validateSqliteCommand(sqliteCommand, this.extensionPath); }
        catch(e) {
            return Promise.reject(e);
        }

        return Promise.resolve(Schema.build(dbPath, sqliteCommand));
    }
    
    dispose() {
        // Nothing to dispose
    }
}

export interface QueryResult {resultSet?: ResultSet; error?: Error; }

export default SQLite;