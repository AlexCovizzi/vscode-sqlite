import { Position, workspace, window, ViewColumn, Selection, TextDocument } from "vscode";
import { isArray } from "util";
import { includes } from "../common/arrays";
import { normalizeString } from "../common/strings";

export function createTextDocument(language?: string, content?: string, cursorPos: Position = new Position(0,0), show: boolean = false): Thenable<TextDocument> {
    return workspace.openTextDocument({language: language, content: content}).then(document => {
        if (show) {
            window.showTextDocument(document, ViewColumn.One).then(editor => {
                editor.selection = new Selection(cursorPos, cursorPos);
            });
        }
        return Promise.resolve(document);
    });
}

export function getActiveTextDocument(language?: string|string[]): TextDocument | undefined {
    let editor = window.activeTextEditor;
    if (!editor) return undefined;
    if (!language) return editor.document;

    let languages = normalizeString(isArray(language)? language : [language]);
    let documentLang = normalizeString(editor.document.languageId);
    if (includes(languages, documentLang)) return editor.document;
    else return undefined;
}