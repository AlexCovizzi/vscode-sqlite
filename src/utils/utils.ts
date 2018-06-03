import { platform } from "os";
import { join } from "path";

export function sanitizeStringForHtml(s: string): string {
    s = s.replace('&', '&amp;');
    s = s.replace('/', '&#x2F;');
    s = s.replace(/<(\w+)>/, '&lt;$1&gt;');
    return s;
}

export function getSqlitePath(extensionPath: string) {
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
        return join(extensionPath, 'bin', sqliteBin);
    } else {
        return '';
    }
}

export function randomString(length: number) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}