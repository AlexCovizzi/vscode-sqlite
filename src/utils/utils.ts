
/**
 * Sanitizes a string for html
 */
export function sanitizeStringForHtml(str: string): string {
    let map: {[char: string]: string} = {
        '&': "&amp;",
        '<': "&lt;",
        '>': "&gt;",
        '/': "&#x2F;",
        '"': "&quot;",
        '\'': "&#039;"
    };
    
    return str.replace(/[&<>\/"']/g, m => map[m]);
}

export function replaceEscapedOctetsWithChar(s: string) {
    return s.replace(/(?:^|[^\\])((?:\\[0-9]{3})+)/g, (substring: string, ...args: any[]) => {
        let capgroup: string = args[0].toString();
        let prevChar: string = '';
        if (substring.length > capgroup.length) {
            prevChar = substring[0];
        }
        let octal = capgroup.split('\\').filter(s => s.trim() !== "");
        try {
            let chars = octalToChars(octal);
            return prevChar + chars;
        } catch(err) {
            return substring;
        }
    });
}

export function octalToChars(octal: Array<string>) {
    let hex: string = octal.map(octet => convertFromBaseToBase(octet, 8, 16)).join('');
    let s = new Buffer(hex, 'hex').toString('utf8');
    for(let i=0; i<s.length; i++) {
        if(s.charCodeAt(i) === 65533) {
            // the character is an uncknown character, this is probably binary data
            return hex;
        }
    }
    return s;
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

export function randomString(length: number, extended: boolean = false) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if (extended) possible += "èé+*][ò@à#°ù§-_!£$%&/()=<>^ì?";

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

export function queryObject(obj: Object, query: string): Object | undefined {
    let ret: Object | undefined = obj;
    let tokens = query.split('/').filter(tkn => tkn !== "");
    while(true) {
        let token = tokens.shift();
        if (token && ret) {
            ret = (<any>ret)[token];
        } else {
            break;
        }
    }
    return ret;
}

export function uniqueBy<T>(arr: T[], prop: string): T[] {
    var seen: {[key: string]: boolean} = {};
    return arr.filter((item) => {
        let k = (item as any)[prop];
        return k && seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
}