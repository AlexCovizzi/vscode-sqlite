'use strict';

import { ExtensionContext } from 'vscode';
import { MainController } from './mainController';
import { logger } from './logging/logger';
import { Constants } from './constants/constants';

let controller: MainController;

export function activate(context: ExtensionContext): Promise<boolean> {
<<<<<<< HEAD
    OutputLogger.log(`Activating extension ${Constants.extensionName}-v${Constants.extensionVersion}...`);
=======
>>>>>>> dev

    controller = new MainController(context);

    logger.info(`Activating extension ${Constants.extensionName} v${Constants.extensionVersion}...`);
    
    context.subscriptions.push(controller);

    return controller.activate();
}

// this method is called when your extension is deactivated
export function deactivate() {
    
}