import { commands, window } from "vscode";

export interface ErrorMessageAction {
    title: string;
    command: string;
    args?: any[];
}

/**
 * Show an error message with actions that if clicked lauch a command.
 * @param message The message to show.
 * @param actions The actions to show with the message.
 */
export function showErrorMessage(message: string, ...actions: ErrorMessageAction[]) {
    let items = actions.map(action => action.title);
    window.showErrorMessage(message, ...items).then(item => {
        actions.forEach(action => {
            if (action.title === item) {
                commands.executeCommand(action.command, ...(action.args? action.args : []));
            }
        });
    });
}