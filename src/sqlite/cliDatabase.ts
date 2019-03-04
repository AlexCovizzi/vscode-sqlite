import { ChildProcess, spawn } from "child_process";
import { Transform } from "stream";
import * as csvparser from "csv-parser";
import { EOL } from "os";
import { randomString } from "../utils/utils";
import { Database } from "./interfaces/database";

type ResType = "rows"|"text"|"none";

const RESULT_SEPARATOR = randomString(8); // just a random separator to recognize when there are no more rows

export class CliDatabase implements Database {
    readonly sqliteProcess?: ChildProcess;
    readonly pid?: number;
    private _started: boolean;
    private _ended: boolean;
    private csvParser: Transform;
    private startCallback?: (err: Error) => void;
    private endCallback?: (err?: Error) => void;
    private writeCallback?: (rows: string[][], text: string, err?: Error) => void;
    private execQueue: {stmt: string, resType: ResType, callback?: (rows: string[][], text: string, err?: Error) => void}[];
    private errStr: string;
    private rows: string[][];
    private text: string;
    private resType: ResType;
    private busy: boolean;

    constructor(command: string, dbPath: string, callback?: (err: Error) => void) {
        let args = ["-csv", "-header"];

        this._started = false;
        this._ended = false;
        this.errStr = "";
        this.rows = [];
        this.text = "";
        this.resType = "none";
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
        
        this.sqliteProcess.stdout.setEncoding("utf8").on("data", (data: string|Buffer) => {
            this.onData(data);
        });

        this.csvParser.on("data", (data) => {
            this.onRow(data);
        });
    }

    close(callback?: (err?: Error) => void): void {
        if (this._ended) {
            if (callback) callback(new Error("SQLite process already ended."));
            return;
        }
        try {
            this.run(".exit");
            this._ended = true;
            this.endCallback = callback;
        } catch(err) {
            //if (callback) callback(err);
        }
    }

    select(statement: string, callback?: (rows: string[][], err?: Error) => void) {
        this.run(statement, "rows", (rows, _text, err) => {
            if (callback) callback(rows, err);
        });
    }

    info(statement: string, callback?: (text: string, err?: Error) => void) {
        this.run(statement, "text", (_rows, text, err) => {
            if (callback) callback(text, err);
        });
    }

    exec(statement: string, callback?: (err?: Error) => void) {
        this.run(statement, "none", (_rows, _text, err) => {
            if (callback) callback(err);
        });
    }

    run(statement: string, resType: ResType = "none", callback?: (rows: string[][], text: string, err?: Error) => void) {
        if (this._ended) {
            if (callback) callback([], "", new Error("SQLite process already ended."));
            return;
        }
        this.execQueue.push({stmt: statement, resType: resType, callback: callback});
        if (!this.busy) {
            this.next();
        }
    }

    private _write(text: string) {
        if (!this.sqliteProcess) return;
        
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
            if (this.writeCallback) this.writeCallback([], "", new Error(this.errStr));
        }
        if (this._started) {
            if (this.endCallback) this.endCallback();
        } else {
            if (this.startCallback) this.startCallback(new Error("Failed to open database"));
        }
    }

    private onData(data: string|Buffer) {
        if (this.errStr) return;
        
        data = data.toString();
        let lines = data.split(/\r?\n/);
        for(let i=0, len = lines.length; i<len; i++) {
            let line = lines[i];
            if (line === RESULT_SEPARATOR) {
                if (!this._started) {
                    this._started = true;
                }

                if (this.writeCallback) this.writeCallback(this.rows, this.text.trim());
                this.next();
                continue;
            }
            if (this.resType === "rows") {
                if (i < lines.length-1) line += "\n";
                this.csvParser.write(Buffer.from(line, "utf8"));
            } else if (this.resType === "text") {
                this.text += line;
                if (i < lines.length-1) this.text += "\n";
            }
        }
    }

    private onRow(data: Object) {
        if (this.errStr) return;
        //@ts-ignore
        let row: string[] = Object.values(data);
        this.rows.push(row);
    }

    private onError(data: string|Buffer) {
        this.errStr += data.toString();
        if (this.sqliteProcess) this.sqliteProcess.kill();
    }

    private next() {
        this.rows = [];
        this.text = "";
        this.resType = "none";
        let execObj = this.execQueue.shift();
        if (execObj) {
            this._write(execObj.stmt);
            this._write(`.print ${RESULT_SEPARATOR}${EOL}`);
            this.busy = true;
            this.resType = execObj.resType;
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