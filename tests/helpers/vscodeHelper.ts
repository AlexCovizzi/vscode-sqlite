import { getMockCallWhereParamEquals } from "./mockHelper";
import { commands, ExtensionContext } from "vscode";
import { join } from "path";

export function getRegisteredCommandCallback(command: string) {
    let call = getMockCallWhereParamEquals(
        (commands.registerCommand as jest.Mock).mock,
        0,
        command
    );
    return (call[1] as Function).bind(call[2]);
}

export function mockExtensionContext(): ExtensionContext {
    const rootPath = join(__dirname, "..", "..");
    return {
        subscriptions: [],
        extensionPath: rootPath,
        storagePath: rootPath,
        logPath: rootPath,
        asAbsolutePath: (path) => join(rootPath, path),
        workspaceState: {
            get: jest.fn(),
            update: jest.fn(),
        },
        globalState: {
            get: jest.fn(),
            update: jest.fn(),
        },
    };
}
