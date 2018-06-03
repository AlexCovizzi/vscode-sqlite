import { basename } from "path";
import { Database } from "./sqlite";
import { window, Disposable } from "vscode";
import { OutputLogger } from "../logging/logger";

export class DatabaseStore implements Disposable {

    private dbs: Database[] = [];

    constructor(private sqlitePath: string) {
        OutputLogger.info(`SQLite binary: ${basename(sqlitePath)}`);
    }

    openDatabase(dbPath: string): Database {
        let database = this.getDatabase(dbPath);
        if (database) {
            return database;
        } else {
            database = new Database(this.sqlitePath, dbPath, (err) => {
                window.showErrorMessage(err.message);
                return undefined;
            });
            this.dbs.push(database);

            OutputLogger.info(`Opened database: ${dbPath}`);
    
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

            OutputLogger.info(`Closed database: ${database.dbPath}`);
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

    dispose() {
        this.dbs.forEach(database => {
            database.dispose();
        });
    }
}