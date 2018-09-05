import {execute} from "./sqlite3";
import { Schema } from "./schema";
import { Disposable, window } from "vscode";
import { SQLParser } from "./sqlparser";
import { logger } from "../logging/logger";
import { ResultSet } from "../interfaces";

const sqlite3ErrorMessage = "Unable to execute sqlite3 queries, change the sqlite.sqlite3 setting to fix this issue.";

class SQLite implements Disposable {
    private activated = false;
    
    constructor(private sqlite3: string) {
        if (sqlite3) this.activated = true;
        else window.showErrorMessage(sqlite3ErrorMessage);
    }

    query(dbPath: string, query: string): Promise<QueryResult> {
        if (!this.activated) {
            window.showErrorMessage(sqlite3ErrorMessage);
            return Promise.reject(sqlite3ErrorMessage);
        }

        query = SQLParser.parse(query).join('');
        
        logger.info(`[QUERY] ${query}`);

        return new Promise( resolve => {
            execute(this.sqlite3, dbPath, query, (resultSet, error) => {
                resolve({resultSet: resultSet, error: error} as QueryResult);
            });
        });
    }
    
    schema(dbPath: string) {
        if (!this.activated) {
            window.showErrorMessage(sqlite3ErrorMessage);
            return Promise.reject(sqlite3ErrorMessage);
        }

        return Schema.build(dbPath, this.sqlite3);
    }
    
    dispose() {
        // Nothing for now
    }
}

export interface QueryResult {resultSet?: ResultSet; error?: Error; }

export default SQLite;