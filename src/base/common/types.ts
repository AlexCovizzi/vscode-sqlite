export function isObject(obj: any, strict: boolean = true): boolean {
    if (strict) {
        return typeof obj === "object"
            && obj !== null
            && !Array.isArray(obj)
            && !(obj instanceof RegExp)
            && !(obj instanceof Date);
    } else {
        return typeof obj === "object" && obj !== null;
    }
}

export function isArray(obj: any): boolean {
    return Array.isArray(obj)
        && obj !== null;
}