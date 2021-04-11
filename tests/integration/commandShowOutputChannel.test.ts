import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { getRegisteredCommandCallback, mockExtensionContext } from "../helpers/vscodeHelper";
import { Commands } from '../../src/commands';

jest.mock('vscode');

describe(`Command: ${Commands.showOutputChannel}`, () => {

    beforeEach(async () => {
        let extensionContext = mockExtensionContext();
        await extension.activate(extensionContext);
    });

    afterEach(() => {
        extension.deactivate();
        jest.clearAllMocks();
    });

    test(`should show the output channel`, () => {
        expect.assertions(2);

        let showOutputChannelCallback = getRegisteredCommandCallback(Commands.showOutputChannel);
        showOutputChannelCallback();
        
        expect(vscode.window.createOutputChannel).toHaveBeenCalledWith(Constants.outputChannelName);
        let outputChannel = getOutputChannelMock();
        expect(outputChannel.show).toHaveBeenCalledTimes(1);
    });

    function getOutputChannelMock() {
        return (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
    }
});