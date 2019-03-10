import { exists, existsSync, lstatSync } from "fs";

export function isDirectorySync(filePath: string): boolean {
    try {
        var stat = lstatSync(filePath);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

export function isFileSync(filePath: string): boolean {
    try {
        var stat = lstatSync(filePath);
        return stat.isFile();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

export function fileExists(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        exists(filePath, (exists) => {
            resolve(exists);
        });
    });
}

export function fileExistsSync(filePath: string): boolean {
    return existsSync(filePath);
}