import { commands, ExtensionContext, workspace } from "vscode";
import { Commands } from "../commands";
import { Level } from "../logging/logger";

const properties = require('../../package.json').contributes.configuration.properties;

export interface Configuration {
    sqlite3: string;
    logLevel: string;
    recordsPerPage: number;
    databaseExtensions: string[];
    setupDatabase: {
        [dbPath: string]: { sql: string[]; }
    };
}

export function getConfiguration(extensionContext: ExtensionContext) {
    return {
        sqlite3: _sqlite3(extensionContext),
        logLevel: _logLevel(),
        recordsPerPage: _recordsPerPage(),
        databaseExtensions: _databaseExtensions(),
        setupDatabase: _setupDatabase()
    } as Configuration;
}

function _sqlite3(extensionContext: ExtensionContext): string {
    if (hasWorkspaceValue('sqlite.sqlite3') && extensionContext.workspaceState.get("isTrustedWorkspace") == null) {
        commands.executeCommand(Commands.askWorkspaceTrust);
    }
    const isTrustedWorkspace = extensionContext.workspaceState.get("isTrustedWorkspace", false);
    const defaultValue = '';
    const sqlite3 = getValue('sqlite.sqlite3', defaultValue, isTrustedWorkspace);
    return sqlite3;
}

function _logLevel(): string {
    let logLevelConf = workspace.getConfiguration().get<string>('sqlite.logLevel');
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

function _databaseExtensions(): Array<string> {
    let databaseExtensionsDefault: Array<string> = properties["sqlite.databaseExtensions"]["default"] || [];
    let databaseExtensionsConf = workspace.getConfiguration().get<Array<string>>('sqlite.databaseExtensions', []) || [];
    let databaseExtensions = [...new Set(databaseExtensionsConf.concat(...databaseExtensionsDefault))];
    return databaseExtensions;
}

function _setupDatabase(): {[dbPath: string]: { sql: string[]; }} {
    let setupDatabaseConfig = workspace.getConfiguration().get('sqlite.setupDatabase', {});
    return setupDatabaseConfig;
}

function hasWorkspaceValue(section: string): boolean {
    const info = workspace.getConfiguration().inspect(section);
    if (!info) return false;
    return info.workspaceFolderValue != null || info.workspaceValue != null;
}

function getValue<T>(section: string, defaultValue: T, allowWorkspaceSettings: boolean): T {
    const info = workspace.getConfiguration().inspect(section);
    if (!info) return defaultValue;
    if (allowWorkspaceSettings && info.workspaceFolderValue != null) return info.workspaceFolderValue as T;
    if (allowWorkspaceSettings && info.workspaceValue != null) return info.workspaceValue as T;
    if (info.globalValue != null) return info.globalValue as T;
    if (info.defaultValue != null) return info.defaultValue as T;
    return defaultValue;
}