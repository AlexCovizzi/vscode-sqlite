'use strict';

import { existsSync } from 'fs';
import { EventEmitter } from 'events';
import { Disposable } from 'vscode';
import * as DBLite from 'dblite';
import { sanitizeStringForHtml } from './utils';


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
        console.log(`Queries: [ '${queries.join("', '")}' ]`);
        let resultSet = new ResultSet();

        this.queue(queries, resultSet, callback);
    }

    private queue(queries: string[], resultSet: ResultSet, callback?: (result: ResultSet, err: Error | null) => void) {
        if (queries.length === 0) {
            //console.log(resultSet);
            if (callback) {
                callback(resultSet, null);
            }
            return;
        }

        let curQuery = queries.shift();

        this.dblite.query(curQuery, (err: Error | null, rows: Object[]) => {
            if (err) {
                console.log(err.message);
                resultSet.push({header: ['error'], rows: [{error: err.message}] });
            } else {
                resultSet.addRows(rows);
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

export class ResultSet extends Array<Result> {
    rows: Object[] = [];
    cols: string[] = [];

    /*
    constructor(rows: Object[]) {
        this.rows = rows;
        if (this.rows.length > 0) {
            this.cols = Object.keys(this.rows[0]);
        } else {
            this.cols = <string[]>[];
        }
    }
    */

    addRows(rows: Object[]) {
        let header: string[] = [];
        let resultRows: Row[] = [];

        if (rows.length > 0) {
            header = Object.keys(rows[0]);
        }

        rows.forEach(row => {
            let resultRow: Row = {};

            header.forEach(col => {
                resultRow[col] = (<any>row)[col];
            });
            resultRows.push(resultRow);

        });

        this.push({header: header, rows: resultRows});
    }

    toHtmlTable() {
        if (this.cols.length === 0 || this.rows.length === 0) {
            return '';
        }
        let html = '<div class="table-wrapper">';
        html += '<table id="result-table" class="enumerated">';
        html += '<tr><th></th>';
        this.cols.forEach(col => {
            col = sanitizeStringForHtml(col);
            html += '<th>' + col + '</th>';
        });
        html += '</tr>';
        this.rows.forEach(row => {
            html += '<tr><td></td>';
            this.cols.forEach(col => {
                let val: string = (<any>row)[col];
                val = sanitizeStringForHtml(val);
                html += '<td class="cell">' + val + '</td>';
            });
            html += '</tr>';
        });
        html += '</table>';
        html += '</div>';
        return html;
    }
}