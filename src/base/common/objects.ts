import { merge } from "./arrays";
import { isObject, isArray } from "./types";

/**
 * Recursively combine two objects.
 * Arrays are merged.
 * Primitive types (string, number, boolean ...) are substituted.
 */
export function mixin(destination: any, source: any): any {
    if (!isObject(destination)) {
        return source;
    }

    if (isObject(source)) {
        Object.keys(source).forEach(key => {
            if (key in destination) {
                if (isObject(destination[key]) && isObject(source[key])) {
                    mixin(destination[key], source[key]);
                } else if (isArray(destination[key]) && isArray(source[key])) {
                    destination[key] = merge(destination[key], source[key]);
                } else {
                    destination[key] = source[key];
                }
            } else {
                destination[key] = source[key];
            }
        });
    }
    return destination;
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