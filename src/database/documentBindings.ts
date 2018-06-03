import { window } from 'vscode';

interface Bindings {
    [documentId: string]: string;
}

export class DocumentBindings {

    bindings: Bindings = {};

    constructor() {

    }

    set(dbPath: string, documentId?: string) {
        if (documentId) {
            this.bindings[documentId] = dbPath;
        } else {
            let editor = window.activeTextEditor;
            if (editor) {
                let documentId = editor.document.uri.fsPath;
                this.bindings[documentId] = dbPath;
            }
        }
        
    }

    get(documentId: string) {
        return this.bindings[documentId];
    }
}