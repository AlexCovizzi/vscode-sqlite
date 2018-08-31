import { validateOrFallback } from "../utils/cmdSqlite3Utils";
import { workspace, window } from "vscode";

export interface Configuration {
    sqlite3: string;
    logLevel: string;
    recordsPerPage: number;
}

export function getConfiguration(extensionPath: string) {
    return {
        sqlite3: _sqlite3(extensionPath),
        logLevel: _logLevel(),
        recordsPerPage: _recordsPerPage()
    } as Configuration;
}

function _sqlite3(extensionPath: string): string {
    let sqlite3Conf = workspace.getConfiguration().get('sqlite.sqlite3');
    let sqlite3: string | undefined = sqlite3Conf? sqlite3Conf.toString() : '';
    sqlite3 = validateOrFallback(sqlite3, extensionPath);
    if (sqlite3 === undefined) {
        sqlite3 = "";
        window.showErrorMessage("Unable to execute sqlite3 queries, change the sqlite3.sqlite3 setting to fix this issue.");
    }
    return sqlite3;
}

function _logLevel(): string {
    let logLevelConf = workspace.getConfiguration().get('sqlite.logLevel');
    let logLevel = logLevelConf? logLevelConf.toString() : "INFO";
    return logLevel;
}

function _recordsPerPage(): number {
    let recordsPerPageConf = workspace.getConfiguration().get('sqlite.recordsPerPage');
    let recordsPerPage = Number.parseInt(recordsPerPageConf? recordsPerPageConf.toString() : '50');
    return recordsPerPage;
}