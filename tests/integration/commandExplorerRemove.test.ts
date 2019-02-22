import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Commands } from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join } from 'path';
import { setupDatabaseFixture, DatabaseFixture, teardownDatabaseFixture } from '../helpers/fixtureHelper';
import { getMockCallWhereParamEquals } from '../helpers/mockHelper';
import { getRegisteredCommandCallback } from '../helpers/vscodeHelper';

jest.mock('vscode');
jest.setTimeout(2000);

describe(`Command: ${Commands.explorerRemove}`, () => {
    const DATABASE_FIXTURE_NAME = "fake_database";

    let databaseFixture: DatabaseFixture;

    beforeAll(async () => {
        databaseFixture = await setupDatabaseFixture(DATABASE_FIXTURE_NAME);
    });

    afterAll(async () => {
        await teardownDatabaseFixture(databaseFixture);
    });

    beforeEach(async () => {
        let context: any = {subscriptions: [], extensionPath: join(__dirname, "..", "..")};
        await extension.activate(context);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`command ${Commands.explorerRemove} should remove the selected database from the explorer when executed from the tree item context menu`, async () => {
        // we retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        let treeDataProvider: vscode.TreeDataProvider<any> = createTreeViewCall[1].treeDataProvider;
        
        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};
        let explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);

        let explorerRemoveCallback = getRegisteredCommandCallback(Commands.explorerRemove);

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
        // we retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        let treeDataProvider: vscode.TreeDataProvider<any> = createTreeViewCall[1].treeDataProvider;

        // the quickpick returns the fake database item, that is the first item
        (vscode.window.showQuickPick as any) = jest.fn().mockImplementation(async (quickPickItems, options, token) => {
            let items = await quickPickItems;
            return items[0];
        });

        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};
        let explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);

        let explorerRemoveCallback = getRegisteredCommandCallback(Commands.explorerRemove);

        // add the fake database to the explorer
        await explorerAddCallback(uri);

        await explorerRemoveCallback();

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
        // we retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        let treeDataProvider: vscode.TreeDataProvider<any> = createTreeViewCall[1].treeDataProvider;

        // no database is selected from the quickpick
        (vscode.window.showQuickPick as any) = jest.fn().mockResolvedValue(undefined);

        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};
        let explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);

        let explorerRemoveCallback = getRegisteredCommandCallback(Commands.explorerRemove);

        // add the fake database to the explorer
        await explorerAddCallback(uri);

        await explorerRemoveCallback();

        // make sure the explorer tree still has only the fake database item
        let databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren.length).toBe(1);
        let databaseTreeChild = await treeDataProvider.getTreeItem(databaseTreeChildren[0]);
        expect(databaseTreeChild.label).toBe(databaseFixture.name);

        // make sure the treeDataProvider was updated just one time (when we added the database)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);
    });

});