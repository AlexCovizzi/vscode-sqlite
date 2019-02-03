import { TextDocument, window, workspace, ViewColumn, Selection, Position } from "vscode";


export function createSqlDocument(show?: boolean): Thenable<TextDocument> {
    let sqliteDocContent = "-- SQLite\n";
    return workspace.openTextDocument({language: 'sqlite', content: sqliteDocContent}).then(sqlDocument => {
        if (show) {
            window.showTextDocument(sqlDocument, ViewColumn.One).then(editor => {
                let cursorPos = new Position(1, 0);
                editor.selection = new Selection(cursorPos, cursorPos);
            });
        }
        return Promise.resolve(sqlDocument);
    });
}

export function getEditorSqlDocument(): TextDocument | undefined {
    let editor = window.activeTextEditor;
    if (editor) {
        return editor.document.languageId === 'sql' || editor.document.languageId === 'sqlite'? editor.document : undefined;
    } else {
        return undefined;
    }
}
    
export function getEditorSelection(): Selection | undefined {
    let selection = window.activeTextEditor? window.activeTextEditor.selection : undefined;
    selection = selection && selection.isEmpty? undefined : selection;
    return selection;
}