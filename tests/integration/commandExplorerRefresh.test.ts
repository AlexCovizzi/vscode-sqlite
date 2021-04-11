import vscode = require("vscode");
import * as extension from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import sqlite3 = require("sqlite3");
import { getMockCallWhereParamEquals } from "../helpers/mockHelper";
import {
    getRegisteredCommandCallback,
    mockExtensionContext,
} from "../helpers/vscodeHelper";
import { Fixture } from "../fixtures";
import { createDatabase, removeDatabase } from "../helpers/fixtureHelper";
import { Commands } from "../../src/commands";

jest.mock("vscode");

describe(`Command: ${Commands.explorerRefresh}`, () => {
    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: Function;
    let explorerRefreshCallback: Function;

    beforeEach(async () => {
        let extensionContext = mockExtensionContext();
        await extension.activate(extensionContext);

        // retrieve the created vscode.TreeDataProvider
        treeDataProvider = getTreeDataProviderMock();

        // retrieve callback for the registered commands
        explorerAddCallback = getRegisteredCommandCallback(
            Commands.explorerAdd
        );
        explorerRefreshCallback = getRegisteredCommandCallback(
            Commands.explorerRefresh
        );
    });

    afterEach(() => {
        extension.deactivate();
        jest.clearAllMocks();
    });

    test(`should update the explorer tree with the table added to the database`, async () => {
        expect.assertions(2);

        let databaseFixture = Fixture.getMainDatabase();
        await createDatabase(databaseFixture);

        await explorerAddCallback(asUri(databaseFixture.path));

        databaseFixture = await addTableToDatabase(databaseFixture);

        await explorerRefreshCallback();

        // updates the tree 2 times (when adding the database and when refreshing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        await expect(treeDataProvider).toRepresent([databaseFixture]);

        await removeDatabase(databaseFixture);
    });

    test(`should remove the database from the explorer and show an error if it fails to retrieve the database schema`, async () => {
        expect.assertions(3);

        let databaseFixture = Fixture.getEmptyDatabase();
        await createDatabase(databaseFixture);

        await explorerAddCallback(asUri(databaseFixture.path));

        // remove database from files
        await removeDatabase(databaseFixture);

        await explorerRefreshCallback();

        expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);

        // updates the tree 2 times (when adding the database and when removing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        await expect(treeDataProvider).toRepresent([]);
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

    async function addTableToDatabase(
        databaseFixture: Fixture.Database
    ): Promise<Fixture.Database> {
        return await new Promise((resolve, reject) => {
            let table = {
                name: "table_added",
                columns: [
                    { name: "id", type: "TEXT", notnull: true, pk: 1 },
                    { name: "name", type: "TEXT", notnull: false, pk: 0 },
                ],
                records: [],
            };
            databaseFixture.tables.push(table);

            let db = new sqlite3.Database(databaseFixture.path, (err) => {
                if (err) reject(err);
            });

            let stmt = `CREATE TABLE IF NOT EXISTS ${table.name}`;
            stmt += `(`;
            for (let j = 0; j < table.columns.length; j++) {
                let col = table.columns[j];
                stmt += `${col.name} ${col.type} ${
                    col.notnull ? "NOT NULL" : ""
                } ${col.pk > 0 ? "PRIMARY KEY" : ""}`;
                if (j < table.columns.length - 1) stmt += `,`;
            }
            stmt += `)`;
            db.serialize(function () {
                db.run(stmt, (err) => {
                    if (err) reject(err);
                });
            });

            db.close((err) => {
                if (err) reject(err);
                else resolve(databaseFixture);
            });
        });
    }
});
