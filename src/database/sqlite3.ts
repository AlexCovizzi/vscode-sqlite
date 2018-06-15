import * as child_process from 'child_process';
import * as csv_parse from 'csv-parse/lib/sync';
import { DebugLogger } from '../logging/logger';

/* regex */
const reNewLine = /(?!\B\"[^\"]*)\n(?![^\"]*\"\B)/g;

export class SQLite {
    private static EXEC_OUT_BUFFER = 1024*1024; // should be enough to print the query output

    static query(binPath: string, dbPath: string, query: string, callback: (rows: Object[], err?:Error) => void) {
        query = this.sanitizeQuery(query);
        
        const args = [`"${dbPath}"`, `-header`, `-nullvalue "NULL"`, `-echo`, `-cmd ".mode tcl"`, `"${query}"`];
        const cmd = `${binPath} ${args.join(' ')}`;
        DebugLogger.info(`[QUERY CMD] ${cmd}`);

        child_process.exec(cmd, {maxBuffer: SQLite.EXEC_OUT_BUFFER}, (err: Error, stdout: string, stderr: string) => {
            if (err) {
                callback([], this.parseError(err.message));
            } else {
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

    private static parseError(message: string): Error {
        let lines = message.split(reNewLine);
        for (var i=0; i<lines.length; i++) {
            if (lines[i].startsWith('Error')) {
                return new Error(lines[i]);
            }
        }
        return Error();
    }

    private static parseOutput(output: string) {
        let lines = output.split(reNewLine);
        
        let splitted: string[] = [];
        lines.forEach(line => {
            let l = splitted.length;
            if (l === 0) {
                splitted.push(line);
            } else {
                if (line.startsWith('"') && splitted[l-1].startsWith('"')) {
                    splitted[l-1] += "\n"+line;
                } else if (!line.startsWith('"') && !splitted[l-1].startsWith('"') && !splitted[l-1].endsWith(';')) {
                    splitted[l-1] += "\n"+line;
                } else {
                    splitted.push(line);
                }
            }
        });
        splitted = splitted.filter(r => r.length !== 0);
        
        let data: Object[] = [];
        let stmt: string | undefined = undefined;
        splitted.forEach(ln => {
            if (ln.startsWith('"')) {
                let rows = csv_parse(ln, {delimiter: ' ', quote: '"', escape: '"'});
                data.push({stmt: stmt? stmt : "", rows: rows});
                stmt = undefined;
            } else {
                if (stmt) {
                    data.push({stmt: stmt, rows: []});
                }
                stmt = ln;
            }
        });
        return data;
    }
}