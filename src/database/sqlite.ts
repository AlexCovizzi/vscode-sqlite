'use strict';

import { existsSync } from 'fs';
import { basename } from 'path';
import { EventEmitter } from 'events';
import { Disposable } from 'vscode';
import * as DBLite from 'dblite';
import { OutputLogger } from '../logging/logger';
import { ResultSet, Row } from './resultSet';


export class Database extends EventEmitter implements Disposable {
    private dblite: any;
    dbPath: string;

    constructor(sqlitePath: string, dbPath: string, callback: (err: Error) => void) {
        super();
        let self = this;

        this.dbPath = dbPath;
        
        if (!existsSync(sqlitePath) || !sqlitePath) {
            callback(new Error(`Failed to spawn sqlite3 process.`));
            return;
        }

        if (existsSync(dbPath)) {
            /*  In node_modules/dblite.node.js (438:3)
                set self.ignoreErrors = true
                (this way if there is an error dblite is not blocked)
            */
            DBLite.bin = sqlitePath;
            this.dblite = new DBLite(dbPath, '-header');
        } else {
            callback(new Error(`Failed to open '${dbPath}': file does not exist.`));
        }

        this.dblite.on('info', function (data: string) {
            self.emit('info', data);
        });
        
        this.dblite.on('error', function (err: Error) {
            console.log(`Error: ${err.message}`);
            self.emit('error', err);
        });
        
        this.dblite.on('close', function (code: Number) {
            console.log(`Closed database (code ${code})`);
        });
    }

    exec(query: string, callback?: (result: ResultSet, err: Error | null) => void) {
        let queries = this.parse(query);
        
        let resultSet = new ResultSet();

        this.queue(queries, resultSet, callback);
    }

    private queue(queries: string[], resultSet: ResultSet, callback?: (result: ResultSet, err: Error | null) => void) {
        if (queries.length === 0) {
            if (callback) {
                callback(resultSet, null);
            }
            return;
        }

        let curQuery = queries.shift();

        OutputLogger.log(`${curQuery}`, `QUERY][${this.dbPath}`);

        this.dblite.query(curQuery, (err: Error | null, rows: Object[]) => {
            if (err) {
                console.log(err.message);
                resultSet.push({header: ['error'], rows: [{error: err.message}] });
            } else {
                if (rows) {
                    let header = Object.keys(rows[0]);
                    let resultRows: Row[] = [];
                    rows.forEach(row => {
                        let resultRow: Row = {};
                        header.forEach(col => {
                            resultRow[col] = (<any>row)[col];
                        });
                        resultRows.push(resultRow);
                    });
                    resultSet.push({header: header, rows: resultRows});
                }
            }
            this.queue(queries, resultSet, callback);
        });
    }

    private parse(query: string): string[] {
        query = query.trim();
        let queries = query.split(";");
        queries = queries.map(q => q.trim());
        queries = queries.filter(q => q.length > 0);
        queries = queries.map(q => q.concat(";"));
        return queries;
    }

    dispose() {
        this.dblite.close();
    }
}

export class SQLScript {
    queries: string[];

    constructor(script: string) {
        script = script.trim();
        script = this.sanitize(script);

        let queries: string[] = [];
        script.split(';').forEach(element => {
            queries.push(element.trim());
        });
        queries = queries.filter(x => x !== '');
        this.queries = queries;
    }

    private sanitize(s: string): string {
        s = s.trim();
        return s;
    }
}