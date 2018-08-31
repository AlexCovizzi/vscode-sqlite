import {execute, ResultSet} from "./sqlite3";
import { Schema } from "./schema";
import { Disposable } from "vscode";
import { SQLParser } from "./sqlparser";
import { logger } from "../logging/logger";

class SQLite implements Disposable {
    
    constructor(private sqlite3: string) {

    }

    query(dbPath: string, query: string): Promise<QueryResult> {
        query = SQLParser.parse(query).join('');
        
        logger.info(`[QUERY] ${query}`);

        return new Promise( resolve => {
            execute(this.sqlite3, dbPath, query, (resultSet, error) => {
                resolve({resultSet: resultSet, error: error} as QueryResult);
            });
        });
    }
    
    schema(dbPath: string) {
        return Schema.build(dbPath, this.sqlite3);
    }
    
    dispose() {
        // Nothing for now
    }
}

export interface QueryResult {resultSet?: ResultSet; error?: Error; }

export default SQLite;