import * as clipboardy from 'clipboardy';
import { window } from "vscode";

/**
 * Copy a message to clipboard and show a status bar message to confirm the message was copied.
 * @param text The message to copy to clipboard
 */
export function copyToClipboard(text: string) {
    return clipboardy.write(text).then(() => {
        return window.setStatusBarMessage(`Copied '${text}' to clipboard.`, 2000);
    });
}

/**
 * Read a message from the clipboard.
 */
export function readFromClipboard(): Promise<string> {
    return clipboardy.read();
}