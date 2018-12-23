import { workspace } from "vscode";
import { Level } from "../logging/logger";

const properties = require('../../package.json').contributes.configuration.properties;

export interface Configuration {
    sqlite3: string;
    logLevel: string;
    recordsPerPage: number;
}

export function getConfiguration() {
    return {
        sqlite3: _sqlite3(),
        logLevel: _logLevel(),
        recordsPerPage: _recordsPerPage()
    } as Configuration;
}

function _sqlite3(): string {
    let sqlite3Conf = workspace.getConfiguration().get('sqlite.sqlite3');
    let sqlite3: string | undefined = sqlite3Conf? sqlite3Conf.toString() : '';

    return sqlite3;
}

function _logLevel(): string {
    let logLevelConf = workspace.getConfiguration().get('sqlite.logLevel');
    let logLevel: string = properties["sqlite.logLevel"]["default"];

    if (logLevelConf && (<any>Level)[`${logLevelConf}`] != null) {
        logLevel = logLevelConf.toString();
    }
    return logLevel;
}

function _recordsPerPage(): number {
    let recordsPerPageConf = workspace.getConfiguration().get('sqlite.recordsPerPage');
    let recordsPerPage: number = properties["sqlite.recordsPerPage"]["default"];
    if (typeof recordsPerPageConf === "string") {
        let n = Number.parseInt(recordsPerPageConf);
        if (n >= -1) recordsPerPage = n;
    } else if (typeof recordsPerPageConf === "number") {
        if (recordsPerPageConf >= -1) recordsPerPage = recordsPerPageConf;
    }
    return recordsPerPage;
}