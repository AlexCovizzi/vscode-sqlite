import { commands, ExtensionContext, window, workspace } from "vscode";
import { Activatable } from "./activatable";
import { Commands } from "./commands";
import Clipboard from "./utils/clipboard";

interface ExplorerItemWithName {
    name: string;
}

interface ExplorerItemWithPath {
    path: string;
}

export class ClipboardCommandsHandler implements Activatable {
    activate(extensionContext: ExtensionContext): void {
        extensionContext.subscriptions.push(
            commands.registerCommand(
                Commands.explorerCopyName,
                this.onExplorerCopyName,
                this
            ),
            commands.registerCommand(
                Commands.explorerCopyPath,
                this.onExplorerCopyPath,
                this
            ),
            commands.registerCommand(
                Commands.explorerCopyRelativePath,
                this.onExplorerCopyRelativePath,
                this
            )
        );
    }

    deactivate(): void {
        //
    }

    private async onExplorerCopyName(item: ExplorerItemWithName) {
        await this.copyToClipboard(item.name);
    }

    private async onExplorerCopyPath(item: ExplorerItemWithPath) {
        await this.copyToClipboard(item.path);
    }

    private async onExplorerCopyRelativePath(item: ExplorerItemWithPath) {
        let path = workspace.asRelativePath(item.path);
        await this.copyToClipboard(path);
    }

    private async copyToClipboard(text: string) {
        await Clipboard.copy(text);
        window.setStatusBarMessage(`Copied '${text}' to clipboard.`, 2000);
    }
}
