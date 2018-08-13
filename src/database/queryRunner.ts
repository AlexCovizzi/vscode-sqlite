import { Disposable } from "vscode";
import { ResultSet } from "./resultSet";
import { SQLite } from "./sqlite3";
import { SQLParser } from "./sqlparser";
import { logger } from "../logging/logger";
import { Setting } from "../configuration/configuration";

export class QueryRunner implements Disposable {
    private disposable: Disposable;

    constructor(private sqlite3: Setting<string|undefined>) {
        let subscriptions: Disposable[] = [];

        this.disposable = Disposable.from(...subscriptions);
    }

    runQuery(dbPath: string, query: string, callback?: (error: Error) => void): Thenable<ResultSet> {
        let sqlite3: string = this.sqlite3.get() || '';
        if (sqlite3 === '') {
            const err = `Error: sqlite3 command/path not found or invalid.`;
            return new Promise((resolve, reject) => reject(err));
        }

        // remove comments
        query = SQLParser.parse(query).join('');
        logger.info(`[QUERY] ${query}`);
        
        return new Promise ((resolve, reject) => {
            SQLite.query(sqlite3, dbPath, query, (resultSet?: ResultSet, error?: Error) => {
                if (error && callback) {
                    callback(error);
                }

                if (resultSet) {
                    resolve(resultSet);
                } else {
                    reject();
                }
            });
        });
    }

    dispose() {
        this.disposable.dispose();
    }
}