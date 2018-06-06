import { TextDocument } from "vscode";

interface Bindings {
    [documentId: string]: string;
}

export class DatabaseBindings {
    private bindings: Bindings;

    constructor() {
        this.bindings = {};
    }

    bind(document: TextDocument | undefined, dbPath: string) {
        if (document) {
            this.bindings[document.uri.toString()] = dbPath;
        }
    }

    get(document: TextDocument | undefined): string | undefined {
        if (document) {
            return this.bindings[document.uri.toString()];
        } else {
            return undefined;
        }
    }

    unbind(dbPath: string) {
        Object.keys(this.bindings).forEach((docId) => {
            if (this.bindings[docId] === dbPath) {
                delete this.bindings[docId];
            }
        });
    }
}