import { CliDatabase } from "./cliDatabase";

export interface Database {
    readonly path: string;
    execute: (sql: string, callback?: (rows: string[][], err?: Error) => void) => void;
    close: (callback: (err?: Error) => void) => void;
}

interface DatabaseOptions {
    engine: "cli"|"node";
    command?: string;
}

export namespace Database {
    export function open(dbPath: string, options: DatabaseOptions, callback: (err: Error) => void): Database {
        switch (options.engine) {
            case "cli":
                let command = options.command? options.command : "sqlite3";
                return new CliDatabase(command, dbPath, callback);
            default:
                throw Error(`Engine '${options.engine}' not supported.`);
        }
    }
}