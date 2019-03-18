import { window, InputBoxOptions } from 'vscode';

/**
 * Opens an input box to ask the user for input.
 * 
 * Rejects if the input box was canceled (e.g. pressing ESC).
 * Otherwise the returned value will be the string typed by the user or an empty string if the user did not type anything
 * but dismissed the input box with OK.
 */
export function showInputBox(hint?: string): Thenable<string> {
    const options: InputBoxOptions = {
        placeHolder: hint
    };
    return window.showInputBox(options).then(input => {
        if (input === undefined) {
            return Promise.reject();
        }
        return input;
    });
}