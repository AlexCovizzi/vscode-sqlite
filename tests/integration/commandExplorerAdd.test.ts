import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Commands } from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join, basename } from 'path';
import { getRegisteredCommandCallback } from "../helpers/vscodeHelper";
import { DatabaseFixture, setupDatabaseFixture, teardownDatabaseFixture } from '../helpers/fixtureHelper';
import { expectDatabaseFixtureAddedToTree } from "../helpers/explorerTestsHelper";
import { getMockCallWhereParamEquals } from '../helpers/mockHelper';

jest.mock('vscode');

describe(`Command: ${Commands.explorerAdd}`, () => {
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

    test(`command ${Commands.explorerAdd} should add the selected database to the explorer when executed from file context menu`, async () => {
        
        // we retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        let treeDataProvider: vscode.TreeDataProvider<any> = createTreeViewCall[1].treeDataProvider;

        let explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);

        // executing a command from the context menu requires a uri, in our case we just need the system path of the file
        // this is the uri of the database we are trying to open
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);

        // make sure the treeDataProvider updates the tree
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);

        await expectDatabaseFixtureAddedToTree(databaseFixture, treeDataProvider);
    });

    test(`command ${Commands.explorerAdd} should show a quickpick and add the database selected when executed from the command palette`, async () => {
        let findFilesResolvedValues = [{scheme: "file", fsPath: databaseFixture.path}, {scheme: "file", fsPath: join(__dirname, "other_file.db")}];
        (vscode.workspace.findFiles as any) = jest.fn().mockResolvedValue(findFilesResolvedValues);

        // we retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        let treeDataProvider: vscode.TreeDataProvider<any> = createTreeViewCall[1].treeDataProvider;

        let explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);

        // the quickpick returns the fake database item
        (vscode.window.showQuickPick as any) = jest.fn().mockImplementation(async (quickPickItems, options, token) => {
            const items = await quickPickItems;
            // the quickpick should return the fake database
            let fakeDatabaseItem = items.find(item => item.label === databaseFixture.name && item.description === databaseFixture.path);
            return fakeDatabaseItem;
        });

        // we are executing from the command palette so we dont pass any parameter
        await explorerAddCallback();

        // we check that the quickpick has been opened with options: the databases in the workspace, and a file picker

        // we retrieve the items shown by the quickpick (we just need label and description)
        let quickPickItems = await (vscode.window.showQuickPick as jest.Mock).mock.calls[0][0];
        quickPickItems = quickPickItems.map(item => ({label: item.label, description: item.description}));
        
        let expectedQuickPickItems: vscode.QuickPickItem[] = [];
        // workspace database files are first
        expectedQuickPickItems.push(...findFilesResolvedValues.map(file => ({label: basename(file.fsPath), description: file.fsPath}) ));
        // then 'Choose from file' item
        expectedQuickPickItems.push({label: "Choose database from file", description: ''});

        expect(quickPickItems).toEqual(expectedQuickPickItems);

        // make sure the treeDataProvider updates the tree
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);
        
        // finally we make sure the database was added to the tree
        await expectDatabaseFixtureAddedToTree(databaseFixture, treeDataProvider);
    });

    test(`command ${Commands.explorerAdd} should do nothing if no database is selected from the quickpick when executed from the command palette`, async (done) => {
        let findFilesResolvedValues = [{scheme: "file", fsPath: databaseFixture.path}, {scheme: "file", fsPath: join(__dirname, "other_file.db")}];
        (vscode.workspace.findFiles as any) = jest.fn().mockResolvedValue(findFilesResolvedValues);

        // we retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        let treeDataProvider: vscode.TreeDataProvider<any> = createTreeViewCall[1].treeDataProvider;

        let explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);

        // no item is selected
        (vscode.window.showQuickPick as any) = jest.fn().mockResolvedValue(undefined);

        await explorerAddCallback();

        // we check that the quickpick has been opened with options: the databases in the workspace, the :memory: database, and a file picker

        // we retrieve the items shown by the quickpick (we just need label and description)
        let quickPickItems = await (vscode.window.showQuickPick as jest.Mock).mock.calls[0][0];
        quickPickItems = quickPickItems.map(item => ({label: item.label, description: item.description}));
            
        let expectedQuickPickItems: vscode.QuickPickItem[] = [];
        // workspace database files are first
        expectedQuickPickItems.push(...findFilesResolvedValues.map(file => ({label: basename(file.fsPath), description: file.fsPath}) ));
        // then 'Choose from file' item
        expectedQuickPickItems.push({label: "Choose database from file", description: ''});

        expect(quickPickItems).toEqual(expectedQuickPickItems);
        
        // make sure the treeDataProvider does not update the tree since no database is added
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(0);

        // the explorer tree should not have any item
        let databaseTreeChildren = await treeDataProvider.getChildren();
        expect(databaseTreeChildren).toEqual([]);

        done();
    });

});