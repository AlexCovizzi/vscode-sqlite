import { workspace } from "vscode";
import { getConfigurationValue } from "../base/vscode/configuration";
import { isString, isObject } from "util";
import { LogLevel } from "../logging/logger";
import { isNumber, isArray } from "../base/common/types";

export type WindowSetting<T> = T;
export type ResourceSetting<T> = { __workspace__: T, [folderPath: string]: T};

/**
 * Settings values.
 * This interface maps 1:1 the settings contributed in package.json.
 */
export interface Settings {
    sqlite3: WindowSetting<string>;
    logLevel: WindowSetting<string>;
    recordsPerPage: WindowSetting<number>;
    enableForeignKeys: ResourceSetting<boolean>;
    setupDatabase: ResourceSetting<{[path: string]: SetupDatabaseSettings}>;
}

export interface SetupDatabaseSettings {
    attachDatabases: { path: string; alias: string; }[];
    sql: string[];
}

export function getSettings(): Settings {
    let prefix = "sqlite";

    let sqlite3 = getSqlite3(prefix);
    let logLevel = getLogLevel(prefix);
    let recordsPerPage = getRecordsPerPage(prefix);
    let enableForeignKeys = getEnableForeignKeys(prefix);
    let setupDatabase = getSetupDatabase(prefix);

    let settings: Settings = {
        sqlite3: sqlite3,
        logLevel: logLevel,
        recordsPerPage: recordsPerPage,
        enableForeignKeys: enableForeignKeys,
        setupDatabase: setupDatabase
    };

    return settings;
}

function getSqlite3(prefix: string): WindowSetting<string> {
    let defaultValue = "";
    let value = getConfigurationValue<string>(prefix, "sqlite3", defaultValue);
    let isValid = isString(value);
    if (!isValid) value = defaultValue;
    return value;
}

function getLogLevel(prefix: string): WindowSetting<string> {
    let defaultValue = LogLevel.INFO;
    let value = getConfigurationValue<string>(prefix, "logLevel", defaultValue);
    let isValid = isString(value) && Boolean(LogLevel[value.toUpperCase() as LogLevel]);
    if (!isValid) value = defaultValue;
    return value;
}

function getRecordsPerPage(prefix: string): WindowSetting<number> {
    let defaultValue = 25;
    let value = getConfigurationValue<number>(prefix, "recordsPerPage", defaultValue);
    let isValid = isNumber(value, -1);
    if (!isValid) value = defaultValue;
    return value;
}

function getEnableForeignKeys(prefix: string): ResourceSetting<boolean> {
    let defaultValue = false;
    let value = getResourceSetting<boolean>(prefix, "enableForeignKeys", defaultValue);
    for(let key in value) {
        if (value[key] !== true && value[key] !== false) value[key] = defaultValue;
    }
    return value;
}

function getSetupDatabase(prefix: string): ResourceSetting<{[path: string]: SetupDatabaseSettings}> {
    let defaultValue = {};
    let value = getResourceSetting<{[path: string]: SetupDatabaseSettings}>(prefix, "setupDatabase", defaultValue);
    for(let key in value) {
        if (!isObject(value[key])) { delete value[key]; continue; }
        for(let path in value[key]) {
            if (!isArray(value[key][path].attachDatabases)) value[key][path].attachDatabases = [];
            if (!isArray(value[key][path].sql)) value[key][path].sql = [];
        }
    }
    return value;
}

function getResourceSetting<T>(prefix: string, section: string, defaultValue: T): ResourceSetting<T> {
    let resourceSetting: ResourceSetting<T> = {
        __workspace__: getConfigurationValue<T>(prefix, section, defaultValue)
    };

    // get the configuration for each folder in the workspace
    let foldersUris = workspace.workspaceFolders? workspace.workspaceFolders.map(folder => folder.uri) : [];
    foldersUris.forEach(folderUri => {
        resourceSetting[folderUri.fsPath] = getConfigurationValue<T>(prefix, section, defaultValue, folderUri);
    });

    return resourceSetting;
}