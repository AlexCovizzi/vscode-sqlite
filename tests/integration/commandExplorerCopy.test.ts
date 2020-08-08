import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Commands } from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join } from 'path';
import { getMockCallWhereParamEquals } from '../helpers/mockHelper';
import { getRegisteredCommandCallback } from '../helpers/vscodeHelper';
import * as clipboardy from 'clipboardy';
import { Fixture } from '../fixtures';
import { createDatabase, removeDatabase } from '../helpers/fixtureHelper';

jest.mock('vscode');
jest.mock('clipboardy');

describe(`Command: ${Commands.explorerCopyName}`, () => {
    let databaseFixture: Fixture.Database = Fixture.getDatabase(Fixture.DATABASE_MAIN);

    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: any;
    let explorerCopyNameCallback: any;

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
        expect(clipboardy.write).toBeCalledWith(tableName);
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
        expect(clipboardy.write).toBeCalledWith(colName);
    });

});

describe(`Command: ${Commands.explorerCopyPath}`, () => {
    let databaseFixture: Fixture.Database = Fixture.getDatabase(Fixture.DATABASE_MAIN);

    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: any;
    let explorerCopyPathCallback: any;

    beforeAll(async () => {
        await createDatabase(databaseFixture);
    });

    afterAll(async () => {
        await removeDatabase(databaseFixture);
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

    test(`command ${Commands.explorerCopyPath} should copy to clipboard the path of the database selected from the explorer`, async () => {
        expect.assertions(1);

        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);
        
        // we take the first column of the first table of the database added
        let dbPath = databaseFixture.path;
        let databaseTreeChildren = await treeDataProvider.getChildren();
        let databaseTreeChild = databaseTreeChildren[0];

        await explorerCopyPathCallback(databaseTreeChild);

        // make sure the path of the database is copied to the clipboard
        expect(clipboardy.write).toBeCalledWith(dbPath);
    });

});
