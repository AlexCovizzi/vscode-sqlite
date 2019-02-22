import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { getRegisteredCommandCallback } from "../helpers/vscodeHelper";
import { join } from 'path';

jest.mock('vscode');

describe(`Command: ${extension.Commands.showOutputChannel}`, () => {

    beforeEach(() => {
        let context: any = {subscriptions: [], extensionPath: join(__dirname, "..", "..")};
        return extension.activate(context);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`command ${extension.Commands.showOutputChannel} should show the output channel`, () => {
        // the output channel should have been created with name Constants.outputChannelName
        expect(vscode.window.createOutputChannel).toHaveBeenCalledWith(Constants.outputChannelName);
        // retrieve the callback registered for the showOutputChannel command
        let showOutputChannelCallback = getRegisteredCommandCallback(extension.Commands.showOutputChannel);

        // execute the command registered
        showOutputChannelCallback();

        // retrieve the created output channel
        let mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
        // make sure show has been called
        expect(mockOutputChannel.show).toHaveBeenCalled();
    });
});