import { DatabaseStore } from "../database/databaseStore";
import { Disposable } from "vscode";
import { ResultSet } from "../database/resultSet";

export class QueryRunner implements Disposable {
    private disposable: Disposable;

    constructor(private databaseStore: DatabaseStore) {
        let subscriptions: Disposable[] = [];

        this.disposable = Disposable.from(...subscriptions);
    }

    runQuery(dbPath: string, query: string): Thenable<ResultSet> {
        let database = this.databaseStore.getDatabase(dbPath);
        return new Promise ((resolve, reject) => {
            if (database) {
                database.exec(query, (resultSet) => {
                    resolve(resultSet);
                });
            } else {
                reject(`Can't execute query. Database is closed.`);
            }
        });
    }

    dispose() {
        this.disposable.dispose();
    }
}