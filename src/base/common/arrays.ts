import { isObject } from "./types";

/**
 * Merge two arrays.
 * @param allowDuplicates If this is `true` the returned array is the concatenation of the two arrays passed as argument,
 * otherwise, duplicate items (objects, arrays, others) are ignored
 */
export function merge<T>(arrA: T[], arrB: T[], allowDuplicates: boolean = false): T[] {
    if (arrA.length === 0) return arrB;
    if (arrB.length === 0) return arrA;

    if (allowDuplicates) return arrA.concat(arrB);

    let arr: T[] = [];
    let joined = [...arrA, ...arrB];
    for(let elemJoined of joined) {
        let duplicate = false;
        for(let elemArr of arr) {
            if (isObject(elemJoined, false) && isObject(elemArr, false)) {
                if (JSON.stringify(elemJoined) === JSON.stringify(elemArr)) {
                    duplicate = true;
                    break;
                }
            } else {
                if (elemJoined === elemArr) {
                    duplicate = true;
                    break;
                }
            }
        }
        if (!duplicate) {
            arr.push(elemJoined);
        }
    }

    return arr;
}

export function includes<T>(arr: T[], item: T): boolean {
    return (arr.indexOf(item) > -1);
}