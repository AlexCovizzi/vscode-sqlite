import { DatabaseStore } from "../database/databaseStore";
import { Disposable, commands } from "vscode";

export class SQLRunner implements Disposable {
    private disposable: Disposable;

    constructor(private databaseStore: DatabaseStore) {
        let subscriptions: Disposable[] = [];

        this.disposable = Disposable.from(...subscriptions);
    }

    /**
     * Open the database, process the sql script and feed the queries
     * once the database answers, show the output
     */
    runSql(dbPath: string, sqlScript: string) {
        let database = this.databaseStore.openDatabase(dbPath);
        database.exec(sqlScript, (resultSet, err) => {
            resultSet.forEach(result => {
                console.log(result);
            });
        });
    }

    dispose() {
        this.disposable.dispose();
    }
}