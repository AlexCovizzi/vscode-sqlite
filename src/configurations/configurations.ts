import { workspace } from "vscode";

export namespace Configuration {
    export function sqlite3(): string {
        const sqlite3 = workspace.getConfiguration().get('sqlite.sqlite3');
        return sqlite3? sqlite3.toString() : '';
    }

    export function autopick(): boolean {
        const autopick = workspace.getConfiguration().get('sqlite.autopick');
        return autopick? true : false;
    }
}