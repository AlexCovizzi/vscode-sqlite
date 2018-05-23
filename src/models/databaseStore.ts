import { Database } from "../sqlite";
import { window, Disposable } from "vscode";

export class DatabaseStore extends Array<Database> implements Disposable {

    constructor(private sqlitePath: string) {
        super();
    }

    add(dbPath: string): Database {
        let database = this.get(dbPath);
        if (database) {
            return database;
        } else {
            database = new Database(this.sqlitePath, dbPath, (err) => {
                window.showErrorMessage(err.message);
                return undefined;
            });
            this.push(database);
    
            database.on('info', function (data: string) {
                console.log(data);
            });
            
            database.on('error', function (err: Error) {
                window.showErrorMessage(err.message);
            });

            return database;
        }
    }

    get(dbPath: string) {
        return this.find(db => db.dbPath === dbPath);
    }

    remove(dbPath: string) {
        let database = this.get(dbPath);

        if (database) {
            // remove from array
            let index = this.findIndex(database => database.dbPath === dbPath);
            if (index > -1) {
                this.splice(index, 1);
            }

            database.dispose();
        }
    }

    dispose() {
        this.forEach(database => {
            database.dispose();
        });
    }
}