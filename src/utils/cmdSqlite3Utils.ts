import { spawnSync } from 'child_process';
import { logger } from '../logging/logger';
import { platform } from 'os';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Validate the sqlite3 command/path passed as argument, if not valid fallback to binaries.
 */
export function validateOrFallback(sqlite3: string, extensionPath: string): string | undefined {
    if (!validateCmdSqlite(sqlite3) || sqlite3.trim() === '') {
        logger.warn(`'${sqlite3}' is not recognized as a command.`);
        // fallback to sqlite3 binaries in {extension}/bin
        return sqliteBinariesFallback(extensionPath);
    }
    
    if (!validateCmdSqlite(sqlite3)) {
        logger.warn(`'${sqlite3}' is not a valid command. Falling back to binaries.`);
        // fallback to sqlite3 binaries in {extension}/bin
        return sqliteBinariesFallback(extensionPath);
    }

    return sqlite3;
}

function sqliteBinariesFallback(extensionPath: string): string | undefined {
    let binPath = getSqliteBinariesPath(extensionPath);
    if (binPath === '') {
        logger.error(`Fallback binaries not found.`);
        return undefined;
    } else {
        logger.info(`Fallback binaries found: '${binPath}'`);
    }

    if (!validateCmdSqlite(binPath)) {
        logger.error(`Invalid binaries '${binPath}'.`);
        return undefined;
    } else {
        return binPath;
    }
}

function validateCmdSqlite(cmdSqlite: string) {
    try {
        let out = spawnSync(`"${cmdSqlite}"`, [`-version`], {shell: true});
        // out must be: {version at least 3} {date} {time}}
        // this is a naive way to check that the command is for sqlite3 after version 3.9
        if (out.stdout.toString().match(/3\.[0-9]{1,2}\.[0-9]{1,2} [0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}\:[0-9]{2}\:[0-9]{2}/)) {
            return true;
        }
    } catch(e) {
        return logger.error(e.message);
    }
    return false;
}


/**
 * Get the path of the sqlite3 binaries based on the platform.
 * If there are no binaries for the platform returns an empty string.
 * @param extensionPath The path of this extension
 */
function getSqliteBinariesPath(extensionPath: string) {
    let plat = platform();
    let sqliteBin: string;

    // TODO: move version number to package.json and import it from there
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
            sqliteBin = '';
            break;
    }
    if (sqliteBin) {
        let path = join(extensionPath, 'bin', sqliteBin);
        return existsSync(path)? path : '';
    } else {
        return '';
    }
}