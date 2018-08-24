import * as child_process from 'child_process';
import { StreamParser } from './streamParser';
import { ResultSetParser } from './resultSetParser';
import { ResultSet } from './resultSet';
import { logger } from '../logging/logger';

export class SQLite {

    static query(cmdSqlite: string, dbPath: string, query: string, callback: (resultSet?: ResultSet, error?: Error) => void) {
        let resultSet: ResultSet;
        let error: Error;
        let streamParser = new StreamParser(new ResultSetParser());
        
        let queryStart = Date.now();

        let args = [
            `${dbPath}`, `${query}`,
            `-header`, // print the headers before the result rows
            `-nullvalue`, `NULL`, // print NULL for null values
            `-echo`, // print the statement before the result
            `-cmd`, `.mode tcl`
            ];

        let proc = child_process.spawn(cmdSqlite, args, {stdio: ['ignore', "pipe", "pipe" ]});

        proc.stdout.pipe(streamParser).once('done', (data: ResultSet) => {
            logger.debug("Time (query + parsing): " + (Date.now()-queryStart));
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

}