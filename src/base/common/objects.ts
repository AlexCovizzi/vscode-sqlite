import { merge } from "./arrays";
import { isObject, isArray } from "./types";

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