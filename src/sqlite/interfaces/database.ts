export interface Database {
    execute: (statement: string, callback?: (rows: string[][], err?: Error) => void) => void;
    close: (callback?: (err?: Error) => void) => void;
}