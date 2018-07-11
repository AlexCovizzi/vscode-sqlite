import { Disposable } from "vscode";
import { ResultSet } from "../database/resultSet";
import { SQLite } from "../database/sqlite3";
import { SQLParser } from "./sqlparser";
import { logger } from "../logging/logger";
import { Setting } from "../configuration/configuration";

export class QueryRunner implements Disposable {
    private disposable: Disposable;

    constructor(private sqlite3: Setting<string|undefined>, ) {
        let subscriptions: Disposable[] = [];

        this.disposable = Disposable.from(...subscriptions);
    }

    runQuery(dbPath: string, query: string): Thenable<ResultSet> {
        let sqlite3: string = this.sqlite3.get() || '';
        if (sqlite3 === '') {
            const err = `Error: sqlite3 command/path not found or invalid.`;
            return new Promise((resolve, reject) => reject(err));
        }

        // remove comments
        query = SQLParser.parse(query).join(';\n') + ";";
        logger.info(`[QUERY] ${query}`);
        
        return new Promise ((resolve, reject) => {
            SQLite.query(sqlite3, dbPath, query, (data: Object[], err?: Error) => {
                if (err) {
                    reject(err.message);
                } else {
                    let resultSet = new ResultSet();
                    data.forEach((obj, index) => {
                        let stmt = (<any> obj)['stmt'];
                        let rows = (<any> obj)['rows'];
                        resultSet.push({
                            id: index,
                            stmt: stmt,
                            header: rows.length > 0? rows.shift() : [],
                            rows: rows
                        });
                    });
                    resolve(resultSet);
                }
            });
        });
    }

    runQuerySync(dbPath: string, query: string): ResultSet | Error {
        let sqlite3: string = this.sqlite3.get() || '';
        if (sqlite3 === '') {
            const err = `Error: sqlite3 command/path not found or invalid.`;
            return new Error(err);
        }

        // remove comments
        query = SQLParser.parse(query).join(';\n') + ";";
        logger.info(`[QUERY] ${query}`);
        
        let ret = SQLite.querySync(sqlite3, dbPath, query);
        if (ret instanceof Error) {
            return ret;
        } else {
            let resultSet = new ResultSet();
            ret.forEach((obj, index) => {
                let stmt = (<any> obj)['stmt'];
                let rows = (<any> obj)['rows'];
                resultSet.push({
                    id: index,
                    stmt: stmt,
                    header: rows.length > 0? rows.shift() : [],
                    rows: rows
                });
            });
            return resultSet;
        }
    }



    dispose() {
        this.disposable.dispose();
    }
}