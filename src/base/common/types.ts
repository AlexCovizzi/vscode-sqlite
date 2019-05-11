export function isBoolean(obj: any): obj is boolean {
    return (obj === false || obj === true);
}

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

export function isString(obj: any, minLength: number = 0, maxLength: number = Number.MAX_VALUE): obj is string {
    return (
        typeof obj === "string" &&
        obj.length >= minLength &&
        obj.length <= maxLength
    );
}

export function isNumber(obj: any, min: number = Number.MIN_VALUE, max: number = Number.MAX_VALUE): obj is number {
    return (
        typeof obj === "number" &&
        obj >= min &&
        obj <= max
    );
}