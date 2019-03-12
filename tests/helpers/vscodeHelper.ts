import { getMockCallWhereParamEquals } from "./mockHelper";
import { commands } from "vscode";

export function getRegisteredCommandCallback(command: string) {
    let call = getMockCallWhereParamEquals((commands.registerCommand as jest.Mock).mock, 0, command);
    return call[1];
}