import { TextDocument, window, workspace, ViewColumn } from "vscode";

export function getEditorSqlDocument(): TextDocument | undefined {
    let editor = window.activeTextEditor;
    if (editor) {
        return editor.document.languageId === 'sql'? editor.document : undefined;
    } else {
        return undefined;
    }
}

export function newSqlDocument(show?: boolean): Thenable<TextDocument> {
    return new Promise((resolve, reject) => {
        workspace.openTextDocument({language: 'sql'}).then(
            doc => {
                if (show) {
                    window.showTextDocument(doc, ViewColumn.One);
                }
                resolve(doc);
            },
            err => reject(err)
        );
    });
}
