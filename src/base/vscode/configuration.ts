import { workspace } from "vscode";

export function getExtensionConfiguration<T>(prefix: string, defaultConfiguration: T): T {
    let configuration = workspace.getConfiguration().get<T>(prefix);
    if (!configuration) return defaultConfiguration;
    return configuration;
}
