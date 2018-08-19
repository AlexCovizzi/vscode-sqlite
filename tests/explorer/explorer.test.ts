import * as vscode from 'vscode';
import { QueryRunner } from '../../src/database/queryRunner';
import * as treeProvider from '../../src/explorer/explorerTreeProvider';
import { SQLiteExplorer } from '../../src/explorer/explorer';
import { Setting } from '../../src/configuration/configuration';
import { Constants } from '../../src/constants/constants';

jest.mock("vscode");
jest.mock("../../src/database/queryRunner");
jest.mock("../../src/explorer/explorerTreeProvider");

describe("explorer.ts", () => {

    describe("SQLiteExplorer", () => {

        test("new should create the treeView with ExplorerTreeProvider as treeDataProvider", () => {
            const mockExplorerTreeProvider = {};
            (treeProvider.ExplorerTreeProvider as any) = jest.fn().mockImplementation(() => {
                return mockExplorerTreeProvider;
            });

            let explorer = new SQLiteExplorer(new QueryRunner(new Setting()));

            expect(vscode.window.createTreeView).toBeCalledWith(Constants.sqliteExplorerViewId, {treeDataProvider: mockExplorerTreeProvider});
        });

        test("addToExplorer should add to the tree the dbPath passed as argument", () => {
            const dbPath = "fake_dbPath";

            const mockExplorerTreeProvider = {addToTree: jest.fn()};
            (treeProvider.ExplorerTreeProvider as any) = jest.fn().mockImplementation(() => {
                return mockExplorerTreeProvider;
            });

            let explorer = new SQLiteExplorer(new QueryRunner(new Setting()));
            explorer.addToExplorer(dbPath);

            expect(mockExplorerTreeProvider.addToTree).toBeCalledWith(dbPath);
        });

        test("removeFromExplorer should remove from the tree the dbPath passed as argument", () => {
            const dbPath = "fake_dbPath";

            const mockExplorerTreeProvider = {removeFromTree: jest.fn()};
            (treeProvider.ExplorerTreeProvider as any) = jest.fn().mockImplementation(() => {
                return mockExplorerTreeProvider;
            });

            let explorer = new SQLiteExplorer(new QueryRunner(new Setting()));
            explorer.removeFromExplorer(dbPath);

            expect(mockExplorerTreeProvider.removeFromTree).toBeCalledWith(dbPath);
        });

        /**
         * Show and Hide explorer based on the number of databases in the tree is a behaviour that could change in the future,
         * so for now no tests
         */
    });
});
