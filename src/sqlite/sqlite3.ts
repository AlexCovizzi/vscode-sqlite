import * as child_process from 'child_process';
import { StreamParser } from './streamParser';
import { ResultSetParser } from './resultSetParser';
import { ResultSet } from '../interfaces';

export function execute(sqlite3: string, dbPath: string, query: string, callback: (resultSet?: ResultSet, error?: Error) => void) {
    if (!sqlite3) {
        const err = `sqlite3 command/path not found or invalid.`;
        return callback(undefined, new Error(err));
    }
    
    let resultSet: ResultSet;
    let error: Error;
    let streamParser = new StreamParser(new ResultSetParser());

    let args = [
        `${dbPath}`, `${query}`,
        `-header`, // print the headers before the result rows
        `-nullvalue`, `NULL`, // print NULL for null values
        `-echo`, // print the statement before the result
        `-cmd`, `.mode tcl`
        ];

    let proc = child_process.spawn(sqlite3, args, {stdio: ['ignore', "pipe", "pipe" ]});

    proc.stdout.pipe(streamParser).once('done', (data: ResultSet) => {
        resultSet = data;
    });
    
    proc.stderr.once('data', (data) => {
        error = new Error(data.toString().trim());
    });

    proc.once('error', (data) => {
        error = data;
    });

    proc.once('close', () => {
        callback(resultSet, error);
    });
}