import vscode = require("vscode");
import * as extension from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join, basename } from "path";
import {
    getRegisteredCommandCallback,
    mockExtensionContext,
} from "../helpers/vscodeHelper";
import { getMockCallWhereParamEquals } from "../helpers/mockHelper";
import { Fixture } from "../fixtures";
import { createDatabase, removeDatabase } from "../helpers/fixtureHelper";
import { Commands } from "../../src/commands";

jest.mock("vscode");

describe(`Command: ${Commands.explorerAdd}`, () => {
    let databaseFixture: Fixture.Database = Fixture.getMainDatabase();

    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: Function;

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
    });

    afterEach(() => {
        extension.deactivate();
        jest.clearAllMocks();
    });

    test(`should add the selected database to the explorer when executed from file context menu`, async () => {
        expect.assertions(2);

        await explorerAddCallback(asUri(databaseFixture.path));

        // make sure the treeDataProvider updates the tree
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);

        await expect(treeDataProvider).toRepresent([databaseFixture]);
    });

    test(`should add the database selected from the quickpick when executed from the command palette`, async () => {
        expect.assertions(6);

        const fileDialogItemLabel = "Choose database from file";

        // findFiles (that should be used to populate the quickpick) returns the fake database and another database
        let findFilesResolvedValues = [
            asUri(databaseFixture.path),
            asUri(join(__dirname, "other_file.db")),
        ];
        vscode.workspace.findFiles = jest
            .fn()
            .mockResolvedValue(findFilesResolvedValues);

        // the quickpick returns the file dialog item so that we can test if it works properly
        vscode.window.showQuickPick = jest
            .fn()
            .mockImplementation(async (quickPickItems, options, token) => {
                let items = await quickPickItems;
                let fileDialogItem = items.find(
                    (item) => item.label === fileDialogItemLabel
                );
                return fileDialogItem;
            });

        // the file dialog returns the fake database uri
        vscode.window.showOpenDialog = jest
            .fn()
            .mockImplementation(async () => {
                let uri = { scheme: "file", fsPath: databaseFixture.path };
                return [uri];
            });

        // we are executing from the command palette so we dont pass any parameter
        await explorerAddCallback();
        // we check that showQuickPick, findFiles and showOpenDialog are called
        expect(vscode.workspace.findFiles).toBeCalledTimes(1);
        expect(vscode.window.showQuickPick).toBeCalledTimes(1);
        expect(vscode.window.showOpenDialog).toBeCalledTimes(1);

        // we check that the quickpick has been opened with options: the databases in the workspace, and a file dialog

        // we retrieve the items passed to showQuickPick (we just need label and description) to test if they are correct
        // Note: they can be a promise, so we use await
        let quickPickItems = await (vscode.window.showQuickPick as jest.Mock)
            .mock.calls[0][0];
        quickPickItems = quickPickItems.map((item) => ({
            label: item.label,
            description: item.description,
        }));

        let expectedQuickPickItems: vscode.QuickPickItem[] = [];
        // workspace database files are first
        expectedQuickPickItems.push(
            ...findFilesResolvedValues.map((file) => ({
                label: basename(file.fsPath),
                description: file.fsPath,
            }))
        );
        // then 'Choose from file' item
        expectedQuickPickItems.push({
            label: fileDialogItemLabel,
            description: "",
        });

        expect(quickPickItems).toEqual(expectedQuickPickItems);

        // make sure the treeDataProvider updates the tree
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(1);

        // finally we test that the database is added to the tree
        await expect(treeDataProvider).toRepresent([databaseFixture]);
    });

    test(`should add an empty database if the database selected is an empty file`, async () => {
        expect.assertions(1);

        let emptyDatabaseFixture = Fixture.getEmptyDatabase();
        await createDatabase(emptyDatabaseFixture);

        // we are executing from the command palette so we dont pass any parameter
        await explorerAddCallback(asUri(emptyDatabaseFixture.path));

        // finally we test that the database is added to the tree
        await expect(treeDataProvider).toRepresent([emptyDatabaseFixture]);

        await removeDatabase(emptyDatabaseFixture);
    });

    test(`should do nothing if no database is selected from the quickpick when executed from the command palette`, async () => {
        expect.assertions(3);

        // no item is selected
        vscode.window.showQuickPick = jest.fn().mockResolvedValue(undefined);

        await explorerAddCallback();

        expect(vscode.window.showQuickPick).toBeCalledTimes(1);

        // make sure the treeDataProvider does not update the tree since no database is added
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(0);

        await expect(treeDataProvider).toRepresent([]);
    });

    test(`should show an error if it fails to retrieve the database schema`, async () => {
        expect.assertions(3);

        // we populate the quickpick with a non existing database and return it when using showQuickPick
        let fakeDbName = "other_file.db";
        vscode.workspace.findFiles = jest
            .fn()
            .mockResolvedValue([
                asUri(join(__dirname, "non_existent_folder", fakeDbName)),
            ]);

        vscode.window.showQuickPick = jest
            .fn()
            .mockImplementation(async (quickPickItems) => {
                const items = await quickPickItems;
                return items.find((item) => item.label === fakeDbName);
            });

        await explorerAddCallback();

        // make sure the treeDataProvider does not update the tree since the database we are trying to add does not exist
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(0);

        await expect(treeDataProvider).toRepresent([]);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
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
