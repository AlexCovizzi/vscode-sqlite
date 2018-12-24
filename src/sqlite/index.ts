import {execute} from "./sqlite";
import { Schema } from "./schema";
import { Disposable } from "vscode";
import { SQLParser } from "./sqlparser";
import { logger } from "../logging/logger";
import { ResultSet } from "../common";
import { validateSqliteCommand } from "./sqliteCommandValidation";

class SQLite implements Disposable {

    constructor(private extensionPath: string) {
    }

    query(sqliteCommand: string, dbPath: string, query: string): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            try {
                sqliteCommand = validateSqliteCommand(sqliteCommand, this.extensionPath);
            } catch(e) {
                return resolve({error: e});
            }
            
            logger.info(`SQLite: '${sqliteCommand}'`);

            query = SQLParser.parse(query).join(' ');
            logger.info(`[QUERY] ${query}`);

            execute(sqliteCommand, dbPath, query, (resultSet, error) => {
                return resolve({resultSet: resultSet, error: error});
            });
        });
    }
    
    schema(sqliteCommand: string, dbPath: string): Promise<Schema.Database> {
        return new Promise((resolve, reject) => {
            try {
                sqliteCommand = validateSqliteCommand(sqliteCommand, this.extensionPath); }
            catch(e) {
                return reject(e);
            }

            return resolve(Schema.build(dbPath, sqliteCommand));
        });
    }
    
    dispose() {
        // Nothing to dispose
    }
}

export interface QueryResult {resultSet?: ResultSet; error?: Error; }

export default SQLite;