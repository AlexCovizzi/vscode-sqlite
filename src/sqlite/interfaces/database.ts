export interface Database {
    select: (statement: string, callback?: (rows: string[][], err?: Error) => void) => void;
    exec: (statement: string, callback?: (err?: Error) => void) => void;
    close: (callback?: (err?: Error) => void) => void;
}