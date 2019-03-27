import { ExtensionConfiguration, getExtensionConfiguration } from "./extensionConfiguration";
import { Uri, workspace } from "vscode";

export interface Configuration {
    get: (resource?: Uri) => ExtensionConfiguration;
    update: () => void;
}

export function getConfiguration(configPrefix: string): Configuration {
    return new ConfigurationImpl(configPrefix);
}

class ConfigurationImpl implements Configuration {
    private configurationMap: Map<Uri, ExtensionConfiguration>;
    private defaultConfiguration!: ExtensionConfiguration;

    constructor(private configPrefix: string) {
        this.configurationMap = new Map<Uri, ExtensionConfiguration>();

        this.update();
    }

    get(resource?: Uri): ExtensionConfiguration {
        if (!resource) return this.defaultConfiguration;
        let folder = workspace.getWorkspaceFolder(resource);
        if (!folder) return this.defaultConfiguration;
        let configuration = this.configurationMap.get(folder.uri);
        if (!configuration) return this.defaultConfiguration;
        return configuration;
    }

    update() {
        this.updateFoldersConfigurations();
        this.updateDefaultConfiguration();
    }

    private updateFoldersConfigurations() {
        let folders = workspace.workspaceFolders || [];
        let folderUris = folders.map(folder => folder.uri);
        for(let uri of folderUris) {
            let workspaceConfiguration = workspace.getConfiguration(this.configPrefix, uri);
            let extensionConfiguration = getExtensionConfiguration(workspaceConfiguration);
            this.configurationMap.set(uri, extensionConfiguration);
        }
    }

    private updateDefaultConfiguration() {
        let workspaceConfiguration = workspace.getConfiguration(this.configPrefix);
        this.defaultConfiguration = getExtensionConfiguration(workspaceConfiguration);
    }
}