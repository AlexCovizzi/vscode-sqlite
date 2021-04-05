import { Configuration } from "./configuration";

export interface ConfigurationChangeAware {
    onConfigurationChange(configuration: Configuration): void;
}

export function isConfigurationChangeAware(
    object: any
): object is ConfigurationChangeAware {
    return (
        "onConfigurationChange" in object &&
        object["onConfigurationChange"] instanceof Function
    );
}
