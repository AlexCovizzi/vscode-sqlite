'use strict';

import { ExtensionContext } from 'vscode';
import { MainController } from './mainController';
import { OutputLogger } from './logging/logger';
import { Constants } from './constants/constants';

let controller: MainController;

export function activate(context: ExtensionContext): Promise<boolean> {
    OutputLogger.log(`Activating extension ${Constants.extensionName}-v${Constants.extensionVersion}...`);

    controller = new MainController(context);
    
    context.subscriptions.push(controller);

    return controller.activate();
}

// this method is called when your extension is deactivated
export function deactivate() {
    
}