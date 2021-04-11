import vscode = require("vscode");
import * as extension from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { getMockCallWhereParamEquals } from "../helpers/mockHelper";
import {
    getRegisteredCommandCallback,
    mockExtensionContext,
} from "../helpers/vscodeHelper";
import { Fixture } from "../fixtures";
import { createDatabase, removeDatabase } from "../helpers/fixtureHelper";
import { Commands } from "../../src/commands";

jest.mock("vscode");

describe(`Command: ${Commands.explorerRemove}`, () => {
    let databaseFixture = Fixture.getMainDatabase();
    let explorerAddCallback: Function;
    let explorerRemoveCallback: Function;
    let treeDataProvider: vscode.TreeDataProvider<any>;

    beforeAll(async () => {
        await createDatabase(databaseFixture);
    });

    afterAll(async () => {
        await removeDatabase(databaseFixture);
    });

    beforeEach(async () => {
        let extensionContext = mockExtensionContext();
        await extension.activate(extensionContext);
        
        // retrieve the created vscode.TreeDataProvider
        treeDataProvider = getTreeDataProviderMock();

        // retrieve callback for the registered commands
        explorerAddCallback = getRegisteredCommandCallback(
            Commands.explorerAdd
        );
        explorerRemoveCallback = getRegisteredCommandCallback(
            Commands.explorerRemove
        );
    });

    afterEach(() => {
        extension.deactivate();
        jest.clearAllMocks();
    });

    test(`should remove the first database from the explorer when executed from the tree item context menu`, async () => {
        expect.assertions(2);

        await explorerAddCallback(asUri(databaseFixture.path));

        let databaseTreeChildren = await treeDataProvider.getChildren();

        await explorerRemoveCallback(databaseTreeChildren[0]);

        // treeDataProvider updates the tree 2 times (when adding the database and when removing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        // explorer tree is now empty
        databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren).toEqual([]);
    });

    test(`should remove the database selected from quickpick when executed from the command palette`, async () => {
        expect.assertions(5);

        await explorerAddCallback(asUri(databaseFixture.path));

        // the quickpick returns the fake database item, that is the first item
        vscode.window.showQuickPick = jest
            .fn()
            .mockImplementation(async (quickPickItems, options, token) => {
                let items = await quickPickItems;
                return items[0];
            });

        await explorerRemoveCallback();

        expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
        let quickPickItems: vscode.QuickPickItem[] = await (vscode.window
            .showQuickPick as jest.Mock).mock.calls[0][0];

        expect(quickPickItems).toHaveLength(1);
        expect(quickPickItems[0].label).toBe(databaseFixture.name);

        // treeDataProvider updates the tree 2 times (when adding the database and when removing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        // the explorer tree is now empty
        let databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren).toEqual([]);
    });

    test(`should do nothing if no database is selected from the quickpick when executed from the command palette`, async () => {
        expect.assertions(3);

        await explorerAddCallback(asUri(databaseFixture.path));

        // no database is selected from the quickpick
        vscode.window.showQuickPick = jest.fn().mockResolvedValue(undefined);

        await explorerRemoveCallback();

        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);

        let databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren).toHaveLength(1);
        let databaseTreeChild = await treeDataProvider.getTreeItem(
            databaseTreeChildren[0]
        );
        expect(databaseTreeChild.label).toBe(databaseFixture.name);
    });

    function asUri(fsPath: string) {
        return { scheme: "file", fsPath: fsPath };
    }

    function getTreeDataProviderMock() {
        let createTreeViewCall = getMockCallWhereParamEquals(
            (vscode.window.createTreeView as jest.Mock).mock,
            0,
            Constants.sqliteExplorerViewId
        );
        return createTreeViewCall[1].treeDataProvider;
    }
});
