// variables are identified with ${[variable name]}
export function replaceVariableWithValue(str: string, values: {[variable: string]: any}, ignoreCase: boolean = true) {
    str = str.replace(/\$\{(\w+)\}/g, (substr: string, ...args: any[]) => {
        let capture = args[0];
        if (ignoreCase) capture = capture.toLowerCase();
        return (values[capture] !== undefined && values[capture] !== null)? values[capture].toString() : "";
    });
    return str;
}