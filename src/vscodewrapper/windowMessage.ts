import { commands, window } from "vscode";


interface MessageAction {
    title: string;
    command?: string;
    args?: any[];
}


export function showErrorMessage(message: string, ...actions: MessageAction[]): Thenable<string | undefined> {
    let items = actions.map(action => action.title);
    return window.showErrorMessage(message, ...items).then((item) => executeSelectedAction(item, actions));
}


export function showWarningMessage(message: string, ...actions: MessageAction[]): Thenable<string | undefined> {
    let items = actions.map(action => action.title);
    return window.showWarningMessage(message, ...items).then((item) => executeSelectedAction(item, actions));
}


function executeSelectedAction(selected: string | undefined, actions: MessageAction[]): Thenable<string | undefined> {
    if (selected == null) return Promise.resolve(selected);
    for (let action of actions) {
        if (selected === action.title) {
            if (action.command) {
                commands.executeCommand(action.command, action.args);
            }
            return Promise.resolve(action.title);
        }
    }
    return Promise.reject(`There is no action associated with the selected item '${selected}'`);
}