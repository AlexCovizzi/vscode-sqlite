import * as child_process from 'child_process';
import * as csv_parse from 'csv-parse/lib/sync';
import { DebugLogger } from '../logging/logger';
import { splitNotInString } from '../utils/utils';
import { platform } from 'os';

/* regex */
const reNewLine = /(?!\B\"[^\"]*)\n(?![^\"]*\"\B)/g; // match new lines not in quotes

export class SQLite {
    private static EXEC_OUT_BUFFER = 1024*1024; // should be enough to print the query output

    static query(cmdSqlite: string, dbPath: string, query: string, callback: (rows: Object[], err?:Error) => void) {
        query = this.sanitizeQuery(query);
        
        const args = [
            `"${dbPath}"`, `"${query}"`,
            `-header`, // print the headers before the result rows
            `-nullvalue "NULL"`, // print NULL for null values
            `-echo`, // print the statement before the result
            `-cmd ".mode tcl"`, // execute this command before the query, in mode tcl each field is in double quotes
            ];
            
        const cmd = `${cmdSqlite} ${args.join(' ')}`;
        DebugLogger.info(`[QUERY CMD] ${cmd}`);

        child_process.exec(cmd, {maxBuffer: SQLite.EXEC_OUT_BUFFER}, (err: Error, stdout: string, stderr: string) => {
            if (err) {
                callback([], this.parseError(err.message));
            } else {
                console.log(stdout);
                callback(this.parseOutput(stdout), undefined);
            }
        });
    }

    /**
     * replace " with \"
     */
    private static sanitizeQuery(query: string) {
        query = query.replace(/\"/g, '\\"');
        return query;
    }

    public static parseError(message: string): Error {
        let lines = message.split(reNewLine);
        for (var i=0; i<lines.length; i++) {
            if (lines[i].startsWith('Error')) {
                return new Error(lines[i]);
            }
        }
        return Error();
    }

    public static parseOutput(output: string) {
        let data: Object[] = [];

        let splitChar = platform() === 'win32'? '\r\n' : '\n';
        let lines = splitNotInString(splitChar, output);
        lines = lines.filter(line => line.trim() !== '');
        
        let stmt = '';
        let rowsStr: string | null = null;
        for (var index = 0; index < lines.length; index++) {
            let line = lines[index];
            let prev = index > 0? lines[index-1] : null;

            if (line.startsWith('"')) {
                if (rowsStr) {
                    rowsStr = rowsStr+'\n'+line;
                } else {
                    rowsStr = line;
                }
                // if its the last line push stmt and rows
                if (index === lines.length-1) {
                    let csv_parse_options = {delimiter: ' ', quote: '"', escape: '\\'};
                    let rows = rowsStr? csv_parse(rowsStr, csv_parse_options) : [];
                    data.push({stmt: stmt, rows: rows});
                }
            } else {
                // push previous (if there is) stmt and rows to data
                if (prev) {
                    let csv_parse_options = {delimiter: ' ', quote: '"', escape: '\\'};
                    let rows = rowsStr? csv_parse(rowsStr, csv_parse_options) : [];
                    data.push({stmt: stmt, rows: rows});
                    rowsStr = null;
                }
                stmt = line;
                // if its the last line push stmt without rows
                if (index === lines.length-1) {
                    data.push({stmt: stmt, rows: []});
                }
            }

        }
        return data;
    }

}