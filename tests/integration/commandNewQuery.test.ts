import vscode = require("vscode");
import * as extension from "../../src/extension";
import {
    getRegisteredCommandCallback,
    mockExtensionContext,
} from "../helpers/vscodeHelper";
import { Commands } from "../../src/commands";

jest.mock("vscode");

describe(`Command: ${Commands.newQuery}`, () => {
    beforeEach(async () => {
        let extensionContext = mockExtensionContext();
        await extension.activate(extensionContext);
    });

    afterEach(() => {
        extension.deactivate();
        jest.clearAllMocks();
    });

    test(`should create an untitled document with languageId 'sqlite' and content '-- SQLite' and show it`, async () => {
        expect.assertions(2);

        let textDocument = jest.fn();
        vscode.workspace.openTextDocument = jest
            .fn()
            .mockResolvedValue(textDocument);

        let newQueryCallback = getRegisteredCommandCallback(Commands.newQuery);
        await newQueryCallback();

        expect(vscode.workspace.openTextDocument).toBeCalledWith({
            language: "sqlite",
            content: "-- SQLite\n",
        });
        expect(vscode.window.showTextDocument).toBeCalledWith(
            textDocument,
            vscode.ViewColumn.One
        );
    });
});
