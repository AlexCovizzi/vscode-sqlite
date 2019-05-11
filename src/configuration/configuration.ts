import { LogLevel } from "../logging/logger";
import { Settings, getSettings, ResourceSetting, SetupDatabaseSettings } from "./settings";
import { Uri, workspace } from "vscode";
import { isString } from "../base/common/types";
import { isAbsolute, join, normalize } from "path";

export interface ExtensionConfiguration {
    update: () => void;
    cliCommand: string;
    logLevel: LogLevel;
    recordsPerPage: number;
    getSqlAfterOpen: (resource?: string | Uri) => string;
}

export function getExtensionConfiguration(): ExtensionConfiguration {
    return new ExtensionConfigurationImpl();
}


class ExtensionConfigurationImpl implements ExtensionConfiguration {
    private settings: Settings;

    cliCommand: string;
    logLevel: LogLevel;
    recordsPerPage: number;

    constructor() {
        this.settings = getSettings();

        this.cliCommand = this.settings.sqlite3;
        this.logLevel = this.settings.logLevel as LogLevel;
        this.recordsPerPage = this.settings.recordsPerPage;

    }

    update() {
        this.settings = getSettings();

        this.cliCommand = this.settings.sqlite3;
        this.logLevel = this.settings.logLevel as LogLevel;
        this.recordsPerPage = this.settings.recordsPerPage;
    }

    getSqlAfterOpen(resource?: string | Uri): string {
        let sql = "";
        let enableForeignKeys = this.getResourceSettingValue(this.settings.enableForeignKeys, resource);
        let setupDatabaseSettings = this.getSetupDatabaseSettings(resource);

        sql += this.buildEnableForeignKeysQuery(enableForeignKeys);

        if (setupDatabaseSettings) {
            sql += this.buildAttachDatabaseQuery(setupDatabaseSettings.attachDatabases);
            sql += this.buildQueryFromList(setupDatabaseSettings.sql);
        }
        
        return sql;
    }

    private getSetupDatabaseSettings(resource?: string | Uri): SetupDatabaseSettings | undefined {
        let setupDatabase = this.getResourceSettingValue(this.settings.setupDatabase, resource);
        let path = resource? (isString(resource)? resource : resource.fsPath) : "";
        let setupDatabaseSettings: SetupDatabaseSettings | undefined = undefined;

        let folderPath = this.getDatabaseFolderPath(path);

        for(let settingPath in setupDatabase) {
            let absSettingPath = isAbsolute(settingPath) || !folderPath? settingPath : join(folderPath, settingPath);
            let absPath = isAbsolute(path) || !folderPath? path : join(folderPath, path);
            if (absPath === absSettingPath) {
                setupDatabaseSettings = setupDatabase[settingPath];
                return setupDatabaseSettings;
            }
        }

        return setupDatabaseSettings;
    }

    private getResourceSettingValue<T>(resourceSetting: ResourceSetting<T>, resource?: string | Uri): T {
        let folderPath = this.getDatabaseFolderPath(resource);

        let value = folderPath? resourceSetting[folderPath] : resourceSetting.__workspace__;
        
        return value;
    }

    private getDatabaseFolderPath(db: string | Uri | undefined): string | undefined {
        let folderPath: string | undefined;
        if (db) {
            let dbUri = isString(db)? Uri.file(db) : db;
            let folderUri = workspace.getWorkspaceFolder(dbUri);
            folderPath = folderUri? folderUri.uri.fsPath : undefined;
        } else {
            folderPath = undefined;
        }
        return folderPath;
    }

    private buildEnableForeignKeysQuery(enableForeignKeys: boolean) {
        if (!enableForeignKeys) return "";
        return "PRAGMA foreign_keys = ON;\n";
    }

    private buildAttachDatabaseQuery(attach: { path: string; alias: string; }[] ) {
        let query = "";
        attach.forEach(db => {
            let basePath = this.getDatabaseFolderPath(db.path);
            let dbPath = isAbsolute(db.path)? db.path : (basePath? join(basePath, db.path) : db.path);
            query += `ATTACH ${dbPath} AS ${db.alias};\n`;
        });
        return query;
    }

    private buildQueryFromList(sql: string[]) {
        return sql.map(q => q.trim()).map(q => q.endsWith(";")? q + ";" : q).join("\n");
    }

}