import { platform } from "os";
import { join } from "path";
import { existsSync } from "fs";
import { StringDecoder } from "string_decoder";

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
    s = replaceEscapedOctetsWithChar(s);
    return s;
}

export function replaceEscapedOctetsWithChar(s: string) {
    return s.replace(/(?:^|[^\\])((?:\\[0-9]{3})+)/g, (substring: string, ...args: any[]) => {
        let capgroup: string = args[0].toString();
        let prevChar: string = '';
        if (substring.length > capgroup.length) {
            prevChar = substring[0];
        }
        let octal = capgroup.split('\\').filter(s => s.trim() !== "");
        let chars = octalToChars(octal);
        return prevChar + chars;
    });
}

export function octalToChars(octal: Array<string>) {
    let hex: string = octal.map(octet => convertFromBaseToBase(octet, 8, 16)).join('');
    return new Buffer(hex, 'hex').toString('utf8');
}

export function convertFromBaseToBase(str: string | number, fromBase: number, toBase: number) {
    if (typeof(str) === 'number') {
        str = str.toString();
    }
    var num = parseInt(str, fromBase);
    return num.toString(toBase);
}

export function splitArrayByCondition<T>(arr: Array<T>, cond: (elem: T) => boolean): Array<T[]> {
    let newArr: Array<T[]> = [];
    arr.forEach(elem => {
        if (cond(elem) || newArr === []) {
            newArr.push([elem]);
        } else {
            newArr[newArr.length-1].push(elem);
        }
    });
    return newArr;
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

export function findNotInString(character: string, str: string) {
    let charArray: Array <string> = Array.from(str);
    let isInString: boolean = false;
    let stringChar: string | null = null;
    let found: number[] = [];

    for (let index = 0; index < charArray.length; index++) {
        let char = charArray[index];
        let prev = index > 0? charArray[index - 1] : null;
        let next = index < charArray.length? charArray[index + 1] : null;

        // it's in string, go to next char
        if (prev !== '\\' && (char === '\'' || char === '"') && isInString === false) {
            isInString = true;
            stringChar = char;
            continue;
        }

        // string closed, go to next char
        if (prev !== '\\' && char === stringChar && isInString === true) {
            isInString = false;
            stringChar = null;
            continue;
        }

        if ((character.length===1? char === character : char === character[0] && next === character[1]) && isInString === false) {
            found.push(index);
            continue;
        }
    }
    return found;
}

export function splitNotInString(char: string, str: string) {
    let idxs = findNotInString(char, str);
    let substrs: string[] = [];
    idxs.forEach( (idx, i) => {
        let start = i > 0? idxs[i-1]+char.length : 0;
        let substr = str.substring(start, idx);
        substrs.push(substr);
    });
    substrs.push(str.substring(idxs === []? 0 : idxs[idxs.length-1]+char.length));
    return substrs;
}

export function randomString(length: number) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}