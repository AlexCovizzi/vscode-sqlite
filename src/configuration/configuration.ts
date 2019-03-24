import { getExtensionConfiguration } from "../base/vscode/configuration";
const configurationSchema = require('../../package.json')["contributes"]["configuration"];
const defaultConfiguration = _getDefaultConfiguration(configurationSchema);

export interface Configuration {
    sqlite3: string;
    logLevel: string;
    recordsPerPage: number;
    databaseConfig: DatabaseConfig;
}

interface DatabaseConfig {
    [dbGlob: string]: DatabaseConfigInstance;
}

interface DatabaseConfigInstance {
    enableForeignKeys: boolean;
    executeAfterOpen: string[];
    executeBeforeClose: string[];
    attachDatabases: {
        path: string;
        alias: string;
    }[];
    executeBeforeStatement: {
        query: string;
        when: string;
    }[];
    executeAfterStatement: {
        query: string;
        when: string;
    }[];
    tableQuery: TableQueryConfig;
}

interface TableQueryConfig {
    [tableGlob: string]: TableQueryConfigInstance;
}

interface TableQueryConfigInstance {
    limit: number;
    offset: number;
    orderBy: string;
    appendSql: string;
    columnsAdd: string[];
    columnsRemove: string[];
    columnsReplace: {
        replace: string;
        when: string;
    }[];
}

export function getConfiguration(): Configuration {
    let configPrefix = "sqlite";
    let extensionConfiguration = getExtensionConfiguration<Configuration>(configPrefix, defaultConfiguration);
    return extensionConfiguration;
}


function _getDefaultConfiguration(schema: any): Configuration {
    let properties = schema["properties"];
    let defaultConfig = {
        sqlite3: properties["sqlite.sqlite3"]["default"],
        logLevel: properties["sqlite.logLevel"]["default"],
        recordsPerPage: properties["sqlite.recordsPerPage"]["default"],
        databaseConfig: properties["sqlite.databaseConfig"]["default"]
    };
    return defaultConfig;
}