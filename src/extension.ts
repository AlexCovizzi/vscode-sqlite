'use strict';

import { ExtensionContext } from 'vscode';
import { MainController } from './controllers/mainController';
import { OutputLogger } from './logging/logger';
import { Constants } from './constants/constants';

export function activate(context: ExtensionContext): Promise<boolean> {

    OutputLogger.info(`Activated extension ${Constants.extensionName}-${Constants.extensionVersion}`);

    const mainController = new MainController(context);

    context.subscriptions.push(mainController);

    return mainController.activate();
}

// this method is called when your extension is deactivated
export function deactivate() {
}