import { ExtensionContext } from "vscode";

export interface Activatable {
    activate(extensionContext: ExtensionContext): void;
    deactivate(): void;
}