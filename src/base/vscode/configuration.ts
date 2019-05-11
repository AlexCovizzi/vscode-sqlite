import { Uri, workspace, WorkspaceConfiguration } from "vscode";

export function getConfigurationValue<T>(prefix: string, section: string, defaultValue: T, scope?: Uri): T {
    let workspaceConfiguration: WorkspaceConfiguration;
    if (scope) {
        workspaceConfiguration = workspace.getConfiguration(prefix, scope);
    } else {
        workspaceConfiguration = workspace.getConfiguration();
        section = prefix + "." + section;
    }
    return workspaceConfiguration.get<T>(section, defaultValue);
}