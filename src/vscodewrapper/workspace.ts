import { TextDocument, window, workspace, ViewColumn, Selection, Position } from "vscode";


const POSITION_ZERO = new Position(0, 0);


export function createSqlDocument(content: string, cursorPos: Position = POSITION_ZERO, show: boolean = true): Thenable<TextDocument> {
    let sqliteDocContent = "-- SQLite\n" + content;
    cursorPos = cursorPos.translate(1);
    return workspace.openTextDocument({language: 'sqlite', content: sqliteDocContent}).then(sqlDocument => {
        if (show) {
            window.showTextDocument(sqlDocument, ViewColumn.One).then(editor => {
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
    // selection = selection && selection.isEmpty? undefined : selection;
    return selection;
}