import sqlite3 = require('sqlite3');
import { unlink } from "fs";
import { Fixture } from "../fixtures";

export function createDatabase(fixture: Fixture.Database): Promise<Fixture.Database> {
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database(fixture.path, (err) => {
            if (err) {
                console.error(err);
                reject(err);
            }
        });

        db.serialize(function() {
            for(let i=0; i<fixture.tables.length; i++) {
                let table = fixture.tables[i];
                let stmt = `CREATE TABLE IF NOT EXISTS ${table.name}`;
                stmt += `(`;
                for(let j=0; j<table.columns.length; j++) {
                    let col = table.columns[j];
                    stmt += `${col.name} ${col.type} ${col.notnull? 'NOT NULL' : ''} ${col.pk>0? 'PRIMARY KEY' : ''}`;
                    if (j < table.columns.length-1) stmt += `,`;
                }
                stmt += `)`;
                db.run(stmt, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                });
            }
        });
        
        db.close((err) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(fixture);
            }
        });
    });
}

export function removeDatabase(fixture: Fixture.Database): Promise<void> {
    // remove testing database
    return new Promise((resolve, reject) => {
        unlink(fixture.path, (err) => {
            if (err) {
                // wait and retry
                //return wait(1).then(async () => await teardownDatabaseFixture(fixtureName));
                console.error(err);
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}