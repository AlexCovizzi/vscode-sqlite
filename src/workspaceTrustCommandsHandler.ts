import { commands, ExtensionContext, window } from "vscode";
import { Activatable } from "./activatable";
import { Commands } from "./commands";
import { showWarningMessage } from "./vscodewrapper";

const TRUSTED_WORKSPACE_KEY = "isTrustedWorkspace";

export class WorkspaceTrustCommandsHandler implements Activatable {
    private extensionContext: ExtensionContext;

    constructor(extensionContext: ExtensionContext) {
        this.extensionContext = extensionContext;
    }

    activate(extensionContext: ExtensionContext): void {
        extensionContext.subscriptions.push(
            commands.registerCommand(
                Commands.changeWorkspaceTrust,
                this.onChangeWorkspaceTrust,
                this
            ),
            commands.registerCommand(
                Commands.askWorkspaceTrust,
                this.onAskWorkspaceTrust,
                this
            )
        );
    }

    deactivate(): void {
        //
    }

    private onAskWorkspaceTrust() {
        if (!this.hasWorkspaceTrustValue()) {
            this.extensionContext.workspaceState.update(
                TRUSTED_WORKSPACE_KEY,
                false
            );
        }
        const actionTrustWorkspace = {
            title: "Trust this workspace",
            command: Commands.changeWorkspaceTrust,
            args: [true],
        };
        const actionOk = {
            title: "Do nothing",
        };
        return showWarningMessage(
            'The workspace setting "sqlite.sqlite3" is disabled by default for the untrusted workspace. ' +
                'If you trust this workspace you can explicitly enable the workspace settings by running the command "SQLite: Change Workspace Trust".',
            actionOk,
            actionTrustWorkspace
        );
    }

    private onChangeWorkspaceTrust(value?: boolean) {
        let trustedWorkspace =
            value != null ? value : !this.isTrustedWorkspace();
        this.extensionContext.workspaceState
            .update(TRUSTED_WORKSPACE_KEY, trustedWorkspace)
            .then(() => {
                const statusBarMessage = trustedWorkspace
                    ? "This workspace is trusted. Workspace settings are enabled."
                    : "This workspace is not trusted. Workspace settings are disabled";
                window.showInformationMessage(statusBarMessage);
                return commands.executeCommand(Commands.reloadSettings);
            });
    }

    private isTrustedWorkspace(): boolean {
        return this.extensionContext.workspaceState.get(
            TRUSTED_WORKSPACE_KEY,
            false
        );
    }

    private hasWorkspaceTrustValue(): boolean {
        return (
            this.extensionContext.workspaceState.get(TRUSTED_WORKSPACE_KEY) !=
            null
        );
    }
}
