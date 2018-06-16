import { platform } from "os";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Sanitizes a string for html, that is:
 * '&' is replaced by '&amp'
 * '/' is replaced by '&#x2F;'
 * '<' and '>' are replaced by '&lt;' and '&gt;'
 * @param s string to sanitize
 */
export function sanitizeStringForHtml(s: string): string {
    s = s.replace('&', '&amp;');
    s = s.replace('/', '&#x2F;');
    s = s.replace(/<(\w+)>/, '&lt;$1&gt;');
    return s;
}

/**
 * Get the path of the sqlite3 binaries based on the platform.
 * If there are no binaries for the platform returns an empty string.
 * @param extensionPath The path of this extension
 */
export function getSqliteBinariesPath(extensionPath: string) {
    let plat = platform();
    let sqliteBin: string;
    switch (plat) {
        case 'win32':
            sqliteBin = 'sqlite-win32-x86.exe';
            break;
        case 'linux':
            sqliteBin = 'sqlite-linux-x86';
            break;
        case 'darwin':
            sqliteBin = 'sqlite-osx-x86';
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


export function randomString(length: number) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}