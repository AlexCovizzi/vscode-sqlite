import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join } from 'path';
import { getMockCallWhereParamEquals } from '../helpers/mockHelper';
import { getRegisteredCommandCallback, mockExtensionContext } from '../helpers/vscodeHelper';
import { Fixture } from '../fixtures';
import { createDatabase, removeDatabase } from '../helpers/fixtureHelper';
import { Commands } from '../../src/commands';

jest.mock('vscode');

describe(`Command: ${Commands.explorerCopyName}`, () => {
    let databaseFixture: Fixture.Database = Fixture.getMainDatabase();

    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: Function;
    let explorerCopyNameCallback: Function;

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
        explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);
        explorerCopyNameCallback = getRegisteredCommandCallback(Commands.explorerCopyName);
    });

    afterEach(() => {
        extension.deactivate();
        jest.clearAllMocks();
    });

    test(`should copy to clipboard the name of the table selected from the explorer`, async () => {
        expect.assertions(1);

        await explorerAddCallback(asUri(databaseFixture.path));

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
        expect(vscode.env.clipboard.writeText).toBeCalledWith(tableName);
    });

    test(`should copy to clipboard the name of the column selected from the explorer`, async () => {
        expect.assertions(1);

        await explorerAddCallback(asUri(databaseFixture.path));

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
        expect(vscode.env.clipboard.writeText).toBeCalledWith(colName);
    });

});

describe(`Command: ${Commands.explorerCopyPath}`, () => {
    let databaseFixture: Fixture.Database = Fixture.getMainDatabase();

    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: Function;
    let explorerCopyPathCallback: Function;

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
        explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);
        explorerCopyPathCallback = getRegisteredCommandCallback(Commands.explorerCopyPath);
    });

    afterEach(() => {
        extension.deactivate();
        jest.clearAllMocks();
    });

    test(`should copy to clipboard the path of the database selected from the explorer`, async () => {
        expect.assertions(1);

        await explorerAddCallback(asUri(databaseFixture.path));
        
        // we take the first column of the first table of the database added
        let dbPath = databaseFixture.path;
        let databaseTreeChildren = await treeDataProvider.getChildren();
        let databaseTreeChild = databaseTreeChildren[0];

        await explorerCopyPathCallback(databaseTreeChild);

        // make sure the path of the database is copied to the clipboard
        expect(vscode.env.clipboard.writeText).toBeCalledWith(dbPath);
    });

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
