import { Database } from "./sqlite";
import { window, Disposable } from "vscode";
import { OutputLogger } from "../logging/logger";

export class DatabaseStore implements Disposable {

    private dbs: Database[] = [];

    constructor(private sqlitePath: string) {
    }

    openDatabase(dbPath: string): Database {
        let database = this.getDatabase(dbPath);
        if (database) {
            return database;
        } else {
            database = new Database(this.sqlitePath, dbPath, (err) => {
                window.showErrorMessage(err.message);
            });
            this.dbs.push(database);

            OutputLogger.log(`Opened database: ${dbPath}`);
    
            database.on('info', function (data: string) {
                console.log(data);
            });
            
            database.on('error', function (err: Error) {
                window.showErrorMessage(err.message);
            });

            return database;
        }
    }

    closeDatabase(dbPath: string) {
        // remove from array
        let index = this.dbs.findIndex(database => database.dbPath === dbPath);
        if (index > -1) {
            let database = this.dbs.splice(index, 1)[0];
            database.dispose();

            OutputLogger.log(`Closed database: ${database.dbPath}`);
        }
    }

    getDatabase(dbPath: string | number) {
        if (typeof dbPath === 'string') {
            return this.dbs.find(db => db.dbPath === dbPath);
        } else {
            return this.dbs[dbPath];
        }
    }

    getAll() {
        return this.dbs;
    }

    empty() {
        return this.dbs.length === 0;
    }

    dispose() {
        this.dbs.forEach(database => {
            database.dispose();
        });
    }
}