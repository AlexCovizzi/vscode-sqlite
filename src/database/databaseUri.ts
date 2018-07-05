import { basename, extname } from "path";

export class DatabaseUri {
    path: string;
    name: string;
    extension: string;

    constructor(path: string) {
        this.path = path;
        this.name = basename(path);
        this.extension = extname(path);
    }
}