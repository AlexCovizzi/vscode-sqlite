'use strict';

import { existsSync } from 'fs';
import { EventEmitter } from 'events';
import { Disposable } from 'vscode';
import { OutputLogger } from '../logging/logger';
import { ResultSet, Row, Result } from './resultSet';
import { SQLParser } from './sqlparser';
import { basename } from 'path';
var DBLite = require('./dblite');


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
            DBLite.bin = sqlitePath;
            this.dblite = new DBLite(dbPath, '-header');
            this.dblite.query('.nullvalue NULL');
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

    exec(query: string, callback?: (resultSet: ResultSet) => void) {
        let stmts = SQLParser.parse(query);
        
        let resultSet = new ResultSet();

        stmts.forEach( (stmt, i) => {
            this.execStmt(stmt, result => {
                if (result) {
                    resultSet.push(result);
                }
                if (i === stmts.length-1) {
                    if (callback) {
                        callback(resultSet);
                    }
                }
            });
        });
    }

    private execStmt(stmt: string, callback: (result: Result | undefined) => void) {
        OutputLogger.log(`[QUERY][${basename(this.dbPath)}] ${stmt}`);

        this.dblite.query(stmt, (err: Error | null, rows: Object[]) => {
            if (err) {
                OutputLogger.log(`[ERROR]${err.message}`);
                callback(undefined);
            } else {
                let result: Result | undefined = undefined;
                if (rows) {
                    let header = Object.keys(rows[0]);
                    let resultRows: Row[] = [];
                    rows.forEach(row => {
                        let resultRow: Row = [];
                        header.forEach(col => {
                            resultRow.push((<any>row)[col]);
                        });
                        resultRows.push(resultRow);
                    });
                    result = {header: header, rows: resultRows};
                }
                callback(result);
            }
        });
    }

    dispose() {
        this.dblite.close();
    }
}