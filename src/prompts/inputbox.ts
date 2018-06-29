import { window, InputBoxOptions } from 'vscode';

export function showQueryInputBox(dbPath: string) {
    const options: InputBoxOptions = {
        placeHolder: `Your query here (database: ${dbPath})`
    };
    return window.showInputBox(options);
}