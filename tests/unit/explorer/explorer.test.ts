import * as vscode from 'vscode';
import * as treeProvider from '../../../src/explorer/explorerTreeProvider';
import Explorer from '../../../src/explorer';
import { Constants } from '../../../src/constants/constants';

jest.mock("vscode");
jest.mock("../../../src/explorer/explorerTreeProvider");

describe("explorer", () => {

    describe("Explorer", () => {

        test("new should create the treeView with ExplorerTreeProvider as treeDataProvider", () => {
            const mockExplorerTreeProvider = {};
            (treeProvider.ExplorerTreeProvider as any) = jest.fn().mockImplementation(() => {
                return mockExplorerTreeProvider;
            });

            let explorer = new Explorer();

            expect(vscode.window.createTreeView).toBeCalledWith(Constants.sqliteExplorerViewId, {treeDataProvider: mockExplorerTreeProvider});
        });

        test("add should add to the tree the database object passed as argument", () => {
            const database = {path: "fake_db", tables: []};

            const mockExplorerTreeProvider = {addToTree: jest.fn()};
            (treeProvider.ExplorerTreeProvider as any) = jest.fn().mockImplementation(() => {
                return mockExplorerTreeProvider;
            });

            let explorer = new Explorer();
            explorer.add(database);

            expect(mockExplorerTreeProvider.addToTree).toBeCalledWith(database);
        });

        test("remove should remove from the tree the dbPath passed as argument", () => {
            const dbPath = "fake_dbPath";

            const mockExplorerTreeProvider = {removeFromTree: jest.fn()};
            (treeProvider.ExplorerTreeProvider as any) = jest.fn().mockImplementation(() => {
                return mockExplorerTreeProvider;
            });

            let explorer = new Explorer();
            explorer.remove(dbPath);

            expect(mockExplorerTreeProvider.removeFromTree).toBeCalledWith(dbPath);
        });
    });
});