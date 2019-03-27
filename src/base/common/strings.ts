
// variables are identified with ${[variable name]}
export function replaceVariableWithValue(str: string, values: {[variable: string]: any}, ignoreCase: boolean = true) {
    str = str.replace(/\$\{(\w+)\}/g, (substr: string, ...args: any[]) => {
        let capture = args[0];
        if (ignoreCase) capture = capture.toLowerCase();
        return (values[capture] !== undefined && values[capture] !== null)? values[capture].toString() : "";
    });
    return str;
}

export interface FormattableString {
    format: (values: {[variable: string]: any}, ignoreCase: boolean) => string;
}

export function createFormattableString(str: string): FormattableString {
    return {
        format(values: {[variable: string]: any}, ignoreCase: boolean = true): string {
            str = str.replace(/\$\{(\w+)\}/g, (substr: string, ...args: any[]) => {
                let capture = args[0];
                if (ignoreCase) capture = capture.toLowerCase();
                return (values[capture] !== undefined && values[capture] !== null)? values[capture].toString() : "";
            });
            return str;
        }
    };
}

/**
 * Normalize, trim, all lower case
 */
export function normalizeString(str: string, trim?: boolean, toLowerCase?: boolean): string;
/**
 * Normalize, trim, all lower case, remove empty
 */
export function normalizeString(strArr: string[], trim?: boolean, toLowerCase?: boolean, removeEmpty?: boolean): string[];

export function normalizeString(strOrArr: string|string[], trim: boolean = true, toLowerCase: boolean = true, removeEmpty: boolean = true): string|string[] {
    if (typeof strOrArr === "string") {
        let str = strOrArr as string;
        str = str.normalize().trim().toLowerCase();
        if (trim) str = str.trim();
        if (toLowerCase) str = str.toLowerCase();
        return str;
    } else {
        let strArr = strOrArr as string[];
        strArr = strArr.map(str => normalizeString(str, trim, toLowerCase));
        if (removeEmpty) strArr = strArr.filter(str => str !== "");
        return strArr;
    }
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