import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Commands } from "../../src/extension";
import { join } from 'path';
import { getRegisteredCommandCallback } from '../helpers/vscodeHelper';

jest.mock('vscode');

describe(`Command: ${Commands.newQuery}`, () => {
    
    let newQueryCallback: any;

    beforeAll(async () => {
        //
    });

    afterAll(async () => {
        //
    });

    beforeEach(async () => {
        let context: any = {subscriptions: [], extensionPath: join(__dirname, "..", "..")};
        await extension.activate(context);

        // retrieve callback for the registered commands
        newQueryCallback = getRegisteredCommandCallback(Commands.newQuery);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`command ${Commands.newQuery} without arguments should create an untitled document with languageId 'sqlite' and content '-- SQLite' and show it`, async () => {
        expect.assertions(2);

        const textDocument = jest.fn();
        (vscode.workspace.openTextDocument as any) = jest.fn().mockResolvedValue(textDocument);

        await newQueryCallback();

        expect(vscode.workspace.openTextDocument).toBeCalledWith({language: "sqlite", content: "-- SQLite\n"});
        expect(vscode.window.showTextDocument).toBeCalledWith(textDocument, vscode.ViewColumn.One);
    });

});