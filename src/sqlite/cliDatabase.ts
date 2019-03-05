import { ChildProcess, spawn } from "child_process";
import { Transform } from "stream";
import * as csvparser from "csv-parser";
import { EOL } from "os";
import { randomString } from "../utils/utils";
import { Database } from "./interfaces/database";

const RESULT_SEPARATOR = randomString(8); // just a random separator to recognize when there are no more rows

export class CliDatabase implements Database {
    readonly sqliteProcess?: ChildProcess;
    readonly pid?: number;
    private _started: boolean;
    private _ended: boolean;
    private csvParser: Transform;
    private startCallback?: (err: Error) => void;
    private endCallback?: (err?: Error) => void;
    private writeCallback?: (rows: string[][], err?: Error) => void;
    private execQueue: {stmt: string, callback?: (rows: string[][], err?: Error) => void}[];
    private errStr: string;
    private rows: string[][];
    private busy: boolean;

    constructor(command: string, dbPath: string, callback?: (err: Error) => void) {
        let args = ["-csv", "-header"];

        this._started = false;
        this._ended = false;
        this.errStr = "";
        this.rows = [];
        this.execQueue = [];
        this.busy = false;
        
        this.startCallback = callback;

        this.csvParser = csvparser({separator: ',', strict: false, headers: false});
        
        try {
            this.sqliteProcess = spawn(command, args, {stdio: ['pipe', "pipe", "pipe" ]});
        } catch(err) {
            let startError = new Error("SQLite process failed to start: "+err.message);
            setTimeout(() => this.onStartError(startError), 0);
            return;
        }

        this.sqliteProcess.once('error', (err: Error) => {
            let startError = new Error("SQLite process failed to start: "+err.message);
            this.onStartError(startError);
        });

        try {
            this._write(`.open '${dbPath}'${EOL}`);
            this._write(`select 1 from sqlite_master;${EOL}`);
            this._write(`.print ${RESULT_SEPARATOR}${EOL}`);
            this.busy = true;
        } catch(err) {
            let startError = new Error(`Failed to open database: '${dbPath}'`);
            setTimeout(() => this.onStartError(startError), 0);
            return;
        }

        this.sqliteProcess.once('exit', (code, signal) => {
            this.onExit(code, signal);
        });

        this.sqliteProcess.stderr.on("data", (data) => {
            this.onError(data);
        });
        
        this.sqliteProcess.stdout.pipe(this.csvParser).on("data", (data: Object) => {
            this.onData(data);
        });
        /*
        this.csvParser.on("data", (data) => {
            this.onRow(data);
        });
        */
    }

    close(callback?: (err?: Error) => void): void {
        if (this._ended) {
            if (callback) callback(new Error("SQLite process already ended."));
            return;
        }
        try {
            this._ended = true;
            this.endCallback = callback;
            this.execQueue.push({stmt: ".exit"});
            if (!this.busy) {
                this.next();
            }
        } catch(err) {
            //
        }
    }
    
    execute(statement: string, callback?: (rows: string[][], err?: Error) => void) {
        if (this._ended) {
            if (callback) callback([], new Error("SQLite process already ended."));
            return;
        }
        // trim the statement
        statement = statement.trim();

        // ignore if it's a dot command
        if (statement.startsWith(".")) {
            return;
        }
        // add a space after EXPLAIN so that the result is a table (see: https://www.sqlite.org/eqp.html)
        if (statement.startsWith("EXPLAIN")) {
            let pos = "EXPLAIN".length;
            statement = statement.slice(0, pos) + " " + statement.slice(pos);
        }

        try {
            this.execQueue.push({stmt: statement, callback: callback});
            if (!this.busy) {
                this.next();
            }
        }catch(err) {
            //
        }
    }

    private _write(text: string) {
        if (!this.sqliteProcess) return;
        
        // add EOL at the end
        if (!text.endsWith("\n")) text += "\n";

        try {
            this.sqliteProcess.stdin.write(text);
        } catch(err) {
            //
        }
    }

    private onStartError(err: Error) {
        this._started = false;
        this.csvParser.end();

        if (this.startCallback) {
            this.startCallback(err);
            this.startCallback = undefined;
        }
    }

    private onExit(code: number|null, signal: string|null) {
        this._ended = true;
        this.csvParser.end();

        if (code === 0) {
            //
        } else if (code === 1 || signal) {
            if (this.writeCallback) this.writeCallback([], new Error(this.errStr));
        }
        if (this._started) {
            if (this.endCallback) this.endCallback();
        } else {
            if (this.startCallback) this.startCallback(new Error("Failed to open database"));
        }
    }
    
    private onData(data: Object) {
        if (this.errStr) return;

        //@ts-ignore
        let row: string[] = Object.values(data);

        if (row.length === 1 && row[0] === RESULT_SEPARATOR) {
            if (!this._started) {
                this._started = true;
            }

            if (this.writeCallback) this.writeCallback(this.rows);
            this.next();
            return;
        }
        
        this.rows.push(row);
    }

    private onError(data: string|Buffer) {
        this.errStr += data.toString();
        // last part of the error output
        if (this.errStr.endsWith("\n")) {
            // reformat the error message
            let match = this.errStr.match(/Error: near line [0-9]+:(?: near "(.+)":)? (.+)/);
            if (match) {
                let token = match[1];
                let rest = match[2];
                this.errStr = `${token? `near "${token}": `: ``}${rest}`;
            }

            if (this.sqliteProcess) this.sqliteProcess.kill();
        }
        
    }

    private next() {
        this.rows = [];
        let execObj = this.execQueue.shift();
        if (execObj) {
            this._write(execObj.stmt);
            this._write(`.print ${RESULT_SEPARATOR}${EOL}`);
            this.busy = true;
            this.writeCallback = execObj.callback;
        } else {
            this.busy = false;
        }
    }

    get ended(): boolean {
        return this._ended;
    }

    get started(): boolean {
        return this._started;
    }
}