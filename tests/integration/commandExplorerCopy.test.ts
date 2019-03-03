import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Commands } from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join, isAbsolute } from 'path';
import { setupDatabaseFixture, DatabaseFixture, teardownDatabaseFixture } from '../helpers/fixtureHelper';
import { getMockCallWhereParamEquals } from '../helpers/mockHelper';
import { getRegisteredCommandCallback } from '../helpers/vscodeHelper';
import * as clipboardy from 'clipboardy';

jest.mock('vscode');
jest.setTimeout(2000);

describe(`Command: ${Commands.explorerCopyName}`, () => {
    const DATABASE_FIXTURE_NAME = "fake_database";

    let databaseFixture: DatabaseFixture;
    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: any;
    let explorerCopyNameCallback: any;

    beforeAll(async () => {
        databaseFixture = await setupDatabaseFixture(DATABASE_FIXTURE_NAME);
    });

    afterAll(async () => {
        await teardownDatabaseFixture(databaseFixture);
    });

    beforeEach(async () => {
        let context: any = {subscriptions: [], extensionPath: join(__dirname, "..", "..")};
        await extension.activate(context);

        // retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        treeDataProvider = createTreeViewCall[1].treeDataProvider;
        // retrieve callback for the registered commands
        explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);
        explorerCopyNameCallback = getRegisteredCommandCallback(Commands.explorerCopyName);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`command ${Commands.explorerCopyName} should copy to clipboard the name of the table selected from the explorer`, async () => {
        expect.assertions(1);
        
        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);

        // we take the first table of the database added
        let tableName = databaseFixture.tables[0].name;
        let databaseTreeChildren = await treeDataProvider.getChildren();
        let databaseTreeChild = databaseTreeChildren[0];
        let tableTreeChildren = await treeDataProvider.getChildren(databaseTreeChild);
        let tableTreeItems = await Promise.all(tableTreeChildren.map(child => treeDataProvider.getTreeItem(child)));
        let tableTreeChildIndex = tableTreeItems.findIndex(item => item.label.includes(tableName));
        let tableTreeChild = tableTreeChildren[tableTreeChildIndex];
        // we use the item as argument of the command explorer.copyName
        await explorerCopyNameCallback(tableTreeChild);

        // make sure the name of the table is copied to the clipboard
        let clipboardText = await clipboardy.read();
        expect(clipboardText).toBe(tableName);
    });

    test(`command ${Commands.explorerCopyName} should copy to clipboard the name of the column selected from the explorer`, async () => {
        expect.assertions(1);
        
        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);

        // we take the first column of the first table of the database added
        let tableName = databaseFixture.tables[0].name;
        let colName = databaseFixture.tables[0].columns[0].name;
        let databaseTreeChildren = await treeDataProvider.getChildren();
        let databaseTreeChild = databaseTreeChildren[0];
        let tableTreeChildren = await treeDataProvider.getChildren(databaseTreeChild);
        let tableTreeItems = await Promise.all(tableTreeChildren.map(child => treeDataProvider.getTreeItem(child)));
        let tableTreeChildIndex = tableTreeItems.findIndex(item => item.label.includes(tableName));
        let tableTreeChild = tableTreeChildren[tableTreeChildIndex];
        let colTreeChildren = await treeDataProvider.getChildren(tableTreeChild);
        let colTreeItems = await Promise.all(colTreeChildren.map(child => treeDataProvider.getTreeItem(child)));
        let colTreeChildIndex = colTreeItems.findIndex(item => item.label.includes(colName));
        let colTreeChild = colTreeChildren[colTreeChildIndex];
        // we use the item as argument of the command explorer.copyName
        await explorerCopyNameCallback(colTreeChild);

        // make sure the name of the column is copied to the clipboard
        let clipboardText = await clipboardy.read();
        expect(clipboardText).toBe(colName);
    });

});

describe(`Command: ${Commands.explorerCopyPath}`, () => {
    const DATABASE_FIXTURE_NAME = "fake_database";

    let databaseFixture: DatabaseFixture;
    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: any;
    let explorerCopyPathCallback: any;

    beforeAll(async () => {
        databaseFixture = await setupDatabaseFixture(DATABASE_FIXTURE_NAME);
    });

    afterAll(async () => {
        await teardownDatabaseFixture(databaseFixture);
    });

    beforeEach(async () => {
        let context: any = {subscriptions: [], extensionPath: join(__dirname, "..", "..")};
        await extension.activate(context);

        // retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        treeDataProvider = createTreeViewCall[1].treeDataProvider;
        // retrieve callback for the registered commands
        explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);
        explorerCopyPathCallback = getRegisteredCommandCallback(Commands.explorerCopyPath);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`command ${Commands.explorerCopyPath} should copy to clipboard the absoulute path of the database selected from the explorer`, async () => {
        expect.assertions(2);
        
        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);
        
        // we take the first column of the first table of the database added
        let dbPath = databaseFixture.path;
        let databaseTreeChildren = await treeDataProvider.getChildren();
        let databaseTreeChild = databaseTreeChildren[0];

        await explorerCopyPathCallback(databaseTreeChild);
        
        // make sure the absolute of the database is copied to the clipboard
        let clipboardText = await clipboardy.read();
        expect(isAbsolute(clipboardText)).toBeTruthy();
        expect(clipboardText).toBe(dbPath);
    });

});
