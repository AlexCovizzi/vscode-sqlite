import { commands, ExtensionContext } from "vscode";
import { Activatable } from "./activatable";
import { Commands } from "./commands";
import { logger } from "./logging/logger";

export class OutputChannelCommandsHandler implements Activatable {
    activate(extensionContext: ExtensionContext): void {
        extensionContext.subscriptions.push(
            commands.registerCommand(Commands.showOutputChannel, () => {
                logger.showOutput();
            })
        );
    }

    deactivate(): void {
        //
    }
}
