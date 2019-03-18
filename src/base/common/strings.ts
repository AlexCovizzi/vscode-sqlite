
// variables are identified with ${[variable name]}
export function replaceVariableWithValue(str: string, values: {[variable: string]: any}, ignoreCase: boolean = true) {
    str = str.replace(/\$\{(\w+)\}/g, (substr: string, ...args: any[]) => {
        let capture = args[0];
        if (ignoreCase) capture = capture.toLowerCase();
        return (values[capture] !== undefined && values[capture] !== null)? values[capture].toString() : "";
    });
    return str;
}

/**
 * Trim, all lower case
 */
export function normalize(str: string): string;
/**
 * Trim, all lower case, remove empty strings
 */
export function normalize(strArr: string[]): string[];

export function normalize(strOrArr: string|string[]): string|string[] {
    if (typeof strOrArr === "string") {
        let str = strOrArr as string;
        return str.trim().toLowerCase();
    } else {
        let strArr = strOrArr as string[];
        return strArr.map(str => str.trim().toLowerCase()).filter(str => str != "");
    }
}