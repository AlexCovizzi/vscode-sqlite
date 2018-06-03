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
        let database = this.databaseStore.openDatabase(dbPath);
        return new Promise ((resolve, reject) => {
            database.exec(query, (resultSet) => {
                if (resultSet.length === 0) {
                    reject('No result found.');
                } else {
                    resolve(resultSet);
                }
            });
        });
    }

    dispose() {
        this.disposable.dispose();
    }
}