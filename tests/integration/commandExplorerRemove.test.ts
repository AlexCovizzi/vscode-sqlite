import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Commands } from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join } from 'path';
import { getMockCallWhereParamEquals } from '../helpers/mockHelper';
import { getRegisteredCommandCallback } from '../helpers/vscodeHelper';
import { Fixture } from '../fixtures';
import { createDatabase, removeDatabase } from '../helpers/fixtureHelper';

jest.mock('vscode');

describe(`Command: ${Commands.explorerRemove}`, () => {
    let databaseFixture = Fixture.getDatabase(Fixture.DATABASE_MAIN);

    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: any;
    let explorerRemoveCallback: any;

    beforeAll(async () => {
        await createDatabase(databaseFixture);
    });

    afterAll(async () => {
        await removeDatabase(databaseFixture);
    });

    beforeEach(async () => {
        let context: any = {subscriptions: [], extensionPath: join(__dirname, "..", ".."), asAbsolutePath: (path) => join(__dirname, "..", "..", path) };
        await extension.activate(context);

        // retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        treeDataProvider = createTreeViewCall[1].treeDataProvider;
        // retrieve callback for the registered commands
        explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);
        explorerRemoveCallback = getRegisteredCommandCallback(Commands.explorerRemove);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`command ${Commands.explorerRemove} should remove the selected database from the explorer when executed from the tree item context menu`, async () => {
        expect.assertions(2);
        
        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);

        let databaseTreeChildren = await treeDataProvider.getChildren();
        let databaseTreeChild = databaseTreeChildren[0];

        // use the tree child as param of explorer remove
        await explorerRemoveCallback(databaseTreeChild);

        // make sure the treeDataProvider updates the tree 2 times (when adding the database and when removing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        // make sure the explorer tree is now empty
        databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren).toEqual([]);
    });
    
    test(`command ${Commands.explorerRemove} should remove the database selected from quickpick when executed from the command palette`, async () => {
        expect.assertions(5);

        // the quickpick returns the fake database item, that is the first item
        (vscode.window.showQuickPick as any) = jest.fn().mockImplementation(async (quickPickItems, options, token) => {
            let items = await quickPickItems;
            return items[0];
        });

        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        // add the fake database to the explorer
        await explorerAddCallback(uri);

        await explorerRemoveCallback();

        expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
        let quickPickItems: vscode.QuickPickItem[] = await (vscode.window.showQuickPick as jest.Mock).mock.calls[0][0];
        // the first and only item should be the fake database
        expect(quickPickItems.length).toBe(1);
        expect(quickPickItems[0].label).toBe(databaseFixture.name);

        // make sure the treeDataProvider updates the tree 2 times (when adding the database and when removing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        // make sure the explorer tree is now empty
        let databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren).toEqual([]);
    });

    
    test(`command ${Commands.explorerRemove} should do nothing if no database is selected from the quickpick when executed from the command palette`, async () => {
        expect.assertions(4);

        // no database is selected from the quickpick
        (vscode.window.showQuickPick as any) = jest.fn().mockResolvedValue(undefined);

        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        // add the fake database to the explorer
        await explorerAddCallback(uri);

        // make sure the treeDataProvider was updated one time
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);

        await explorerRemoveCallback();

        // make sure the explorer tree still has only the fake database item
        let databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren.length).toBe(1);
        let databaseTreeChild = await treeDataProvider.getTreeItem(databaseTreeChildren[0]);
        expect(databaseTreeChild.label).toBe(databaseFixture.name);

        // make sure the treeDataProvider was updated still just one time (when we added the database to the tree)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);
    });

});