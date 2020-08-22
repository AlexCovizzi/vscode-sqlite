export function objectEquals(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key1 in keys1) {
        if (!obj2.hasOwnProperty(key1)) {
            return false;
        }
        if (obj1[key1] !== obj2[key1]) {
            return false;
        }
    }
    return true;
}

export function padLeft(str: string, size: number, char: string = " "): string {
    while (str.length <= size) {
        str = char + str;
    }
    return str;
}

export function padRight(str: string, size: number, char: string = " "): string {
    while (str.length <= size) {
        str = str + char;
    }
    return str;
}

export function merge(...objects: (object | undefined | null)[]) {
    return Object.assign({}, ...objects.filter(o => o != null));
}

export function isThemeLight() {
    return document.body.className.includes("vscode-light");
}

export function isThemeDark() {
    return !isThemeLight();
}