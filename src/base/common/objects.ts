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

/**
 * Replace a property inside an object.
 * NOTE: This function uses `eval`, so make sure the values you are passing are safe.
 * @param instance The object of which you want to chnage the property
 * @param property The "path" to the property, starting with "instance", e.g "instance.person.name"
 * @param newValue The new value to replace
 */
export function replaceProperty(instance: any, property: string, newValue: any) {
    eval(`${property} = newValue`);
}

/**
 * Delete a property inside an object.
 * NOTE: This function uses `eval`, so make sure the values you are passing are safe.
 * @param instance The object of which you want to delete the property
 * @param property The "path" to the property, starting with "instance", e.g "instance.person.name"
 */
export function deleteProperty(instance: any, property: string) {
    eval(`delete ${property}`);
}