'use strict';

import * as vscode from 'vscode';
import { SQLitePanelController } from './panel_controller';

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "vscode-sqlite" is now active!');

    let extensionPath = context.extensionPath;

    let disposable = vscode.commands.registerCommand('extension.openDb', (dbUri) => {

        let panelController = new SQLitePanelController(dbUri, extensionPath);
        
        context.subscriptions.push(panelController);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}