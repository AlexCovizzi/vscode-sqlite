import { LogLevel } from "../logging/logger";
import { BoolExpression } from "../base/common/boolExpression";
import { FormattableString } from "../base/common/strings";
import { WorkspaceConfiguration } from "vscode";
import { isString, isNumber } from "../base/common/types";

export interface ExtensionConfiguration {
    readonly cliCommand: string;
    readonly logLevel: LogLevel;
    readonly recordsPerPage: number;
    readonly databaseConfigMap: Map<string, DatabaseConfig>;
}

interface DatabaseConfig {
    executeAfterOpen: string;
    executeBeforeClose: string;
    sqlBeforeStatement: {
        sql: string;
        when: BoolExpression;
    }[];
    sqlAfterStatement: {
        sql: string;
        when: BoolExpression;
    }[];
    tableQueryConfigMap: Map<string, TableQueryConfig>;
}

interface TableQueryConfig {
    appendSql: string;
    columnsAdd: string[];
    columnsRemove: string[];
    columnsReplace: {
        replace: FormattableString;
        when: BoolExpression;
    }[];
}

export function getExtensionConfiguration(workspaceConfiguration: WorkspaceConfiguration): ExtensionConfiguration {
    let extensionConfiguration = {
        cliCommand: getCliCommandValue("", workspaceConfiguration),
        logLevel: getLogLevelValue(LogLevel.INFO, workspaceConfiguration),
        recordsPerPage: getRecordsPerPage(25, workspaceConfiguration),
        databaseConfigMap: getDatabaseConfigMap(new Map(), workspaceConfiguration)
    };
    return extensionConfiguration;
}

function getCliCommandValue(defaultValue: string, workspaceConfiguration: WorkspaceConfiguration): string {
    let configValue = workspaceConfiguration.get<string>("sqlite3", defaultValue);
    let value = isString(configValue)? configValue : defaultValue;
    return value;
}

function getLogLevelValue(defaultValue: LogLevel, workspaceConfiguration: WorkspaceConfiguration): LogLevel {
    let configValue = workspaceConfiguration.get<LogLevel>("logLevel", defaultValue);
    let value = LogLevel[configValue]? configValue : defaultValue;
    return value;
}

function getRecordsPerPage(defaultValue: number, workspaceConfiguration: WorkspaceConfiguration): number {
    let configValue = workspaceConfiguration.get<number>("recordsPerPage", defaultValue);
    let value = isNumber(configValue, -1)? configValue : defaultValue;
    return value;
}

function getDatabaseConfigMap(defaultValue: Map<string, DatabaseConfig>, workspaceConfiguration: WorkspaceConfiguration): Map<string, DatabaseConfig> {
    let configValue = workspaceConfiguration.get<any>("databaseConfig", defaultValue);
    let value = defaultValue;
    return value;
}