import { spawnSync } from 'child_process';
import { logger } from '../logging/logger';
import { platform } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Validate the sqlite3 command/path passed as argument, if not valid fallback to the binary in the bin directory.
 */
export function validateSqliteCommand(sqliteCommand: string, extensionPath: string): string {
    let isValid = isSqliteCommandValid(sqliteCommand);
    if (isValid) {
        return sqliteCommand;
    } else {
        sqliteCommand = getSqliteBinariesPath(extensionPath);
        if (!sqliteCommand) {
            throw new Error(`Unable to find a valid SQLite command. Fallback binary not found.`);
        }
        isValid = isSqliteCommandValid(sqliteCommand);
        if (isValid) {
            return sqliteCommand;
        } else {
            throw new Error(`Unable to find a valid SQLite command. Fallback binary is not valid.`);
        }
    }
}

// verifies that the command/path passed as argument is an sqlite command
export function isSqliteCommandValid(sqliteCommand: string) {
    let proc = spawnSync(`"${sqliteCommand}"`, [`-version`], {shell: true});
    
    let output = proc.stdout.toString();

    // out must be: {version at least 3} {date} {time}}
    // this is a naive way to check that the command is for sqlite3 after version 3.9
    let match = output.match(/3\.[0-9]{1,2}\.[0-9]{1,2} [0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}\:[0-9]{2}\:[0-9]{2}/);
    
    if(!match) {
        logger.debug(`'${sqliteCommand}' is not a valid SQLite command.`);
    }
    
    return match? true : false;
}


/**
 * Get the path of the sqlite3 binaries based on the platform.
 * If there are no binaries for the platform returns an empty string.
 * @param extensionPath The path of this extension
 */
export function getSqliteBinariesPath(extensionPath: string): string {
    let plat = platform();
    let sqliteBin: string;

    // TODO: move sqlite version number to package.json and import it from there
    switch (plat) {
        case 'win32':
            sqliteBin = 'sqlite-v3.26.0-win32-x86.exe';
            break;
        case 'linux':
            sqliteBin = 'sqlite-v3.26.0-linux-x86';
            break;
        case 'darwin':
            sqliteBin = 'sqlite-v3.26.0-osx-x86';
            break;
        default:
            logger.info(`Fallback binary not found: system OS not recognized.`);
            sqliteBin = '';
            break;
    }
    if (sqliteBin) {
        let path = join(extensionPath, 'bin', sqliteBin);
        if (existsSync(path)) {
            logger.debug(`Fallback SQLite binary found: '${path}'.`);
            return path;
        } else {
            logger.debug(`Fallback SQLite binary not found: '${path}' does not exist.`);
            return '';
        }
    } else {
        return '';
    }
}