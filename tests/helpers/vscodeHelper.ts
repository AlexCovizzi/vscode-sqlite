import * as vscode from "vscode";
import { getMockCallWhereParamEquals } from "./mockHelper";

export function getRegisteredCommandCallback(command: string) {
    let call = getMockCallWhereParamEquals((vscode.commands.registerCommand as jest.Mock).mock, 0, command);
    return call[1];
}