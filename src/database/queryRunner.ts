import { Disposable } from "vscode";
import { ResultSet } from "../database/resultSet";
import { SQLite } from "../database/sqlite3";
import { SQLParser } from "./sqlparser";
import { OutputLogger } from "../logging/logger";

export class QueryRunner implements Disposable {
    private disposable: Disposable;

    constructor(private binPath: string) {
        let subscriptions: Disposable[] = [];

        this.disposable = Disposable.from(...subscriptions);
    }

    runQuery(dbPath: string, query: string): Thenable<ResultSet> {
        // remove comments
        query = SQLParser.parse(query).join(';\n') + ";";
        OutputLogger.log(`[QUERY] ${query}`);
        
        return new Promise ((resolve, reject) => {
            SQLite.query(this.binPath, dbPath, query, (data: Object[], err?: Error) => {
                if (err) {
                    reject(err.message);
                } else {
                    let resultSet = new ResultSet();
                    data.forEach(obj => {
                        let stmt = (<any> obj)['stmt'];
                        let rows = (<any> obj)['rows'];
                        resultSet.push({
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

    dispose() {
        this.disposable.dispose();
    }
}