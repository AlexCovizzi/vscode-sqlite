import { TextDocument, window, workspace, ViewColumn, Selection } from "vscode";


export function createSqlDocument(show?: boolean): Thenable<TextDocument> {
    return workspace.openTextDocument({language: 'sql'}).then(sqlDocument => {
        if (show) {
            window.showTextDocument(sqlDocument, ViewColumn.One);
        }
        return Promise.resolve(sqlDocument);
    });
}

export function getEditorSqlDocument(): TextDocument | undefined {
    let editor = window.activeTextEditor;
    if (editor) {
        return editor.document.languageId === 'sql'? editor.document : undefined;
    } else {
        return undefined;
    }
}
    
export function getEditorSelection(): Selection | undefined {
    let selection = window.activeTextEditor? window.activeTextEditor.selection : undefined;
    selection = selection && selection.isEmpty? undefined : selection;
    return selection;
}