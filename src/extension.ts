'use strict';

import { ExtensionContext } from 'vscode';
import { MainController } from './controllers/mainController';
import { OutputLogger } from './logging/logger';
import { Constants } from './constants/constants';

let controller: MainController;

export function activate(context: ExtensionContext): Promise<boolean> {

    OutputLogger.info(`Activated extension ${Constants.extensionName}-${Constants.extensionVersion}`);

    controller = new MainController(context);

    context.subscriptions.push(controller);

    return controller.activate();
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (controller) {
        controller.deactivate();
    }
}