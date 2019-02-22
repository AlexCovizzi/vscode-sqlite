import * as vscode from 'vscode';
import * as documentDatabase from '../../../src/sqlworkspace/documentDatabaseBindings';
import { DatabaseStatusBarItem } from '../../../src/sqlworkspace/databaseStatusBarItem';

jest.mock("vscode");
jest.mock("../../../src/sqlworkspace/documentDatabaseBindings");

describe("docDatabaseStatusBar.ts", () => {

    describe("DocumentDatabaseStatusBar", () => {

        test("update should hide the status bar item if the editor document is not sql", () => {
            (vscode.window.activeTextEditor.document as any) = { languageId: 'not_sql' };
            const mockHide = jest.fn();
            (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue({
                hide: mockHide
            });

            let docDatabaseStatusBar = new DatabaseStatusBarItem(new documentDatabase.DocumentDatabaseBindings());
            docDatabaseStatusBar.update();
            expect(mockHide).toHaveBeenCalled();
        });

        test("update should show the status bar item and change text to contain db path if the editor document is a sql document with a database", () => {
            const dbPath = "fake_dbPath";
            (vscode.window.activeTextEditor.document as any) = { languageId: 'sql' };
            (documentDatabase.DocumentDatabaseBindings as any) = jest.fn().mockImplementation(() => {
                return {
                    get: jest.fn().mockReturnValue(dbPath)
                };
            });
            const mockShow = jest.fn();
            const mockStatusBarItem = {
                text: "",
                show: mockShow,
            };
            (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);

            let docDatabaseStatusBar = new DatabaseStatusBarItem(new documentDatabase.DocumentDatabaseBindings());
            docDatabaseStatusBar.update();

            expect(mockShow).toHaveBeenCalled();
            expect(mockStatusBarItem.text).toContain(dbPath);
        });

        test("update should show the status bar item and change text to contain 'no database' if the editor document is a sql document without a database", () => {
            const noDatabaseText = "no database";
            (vscode.window.activeTextEditor.document as any) = { languageId: 'sql' };
            (documentDatabase.DocumentDatabaseBindings as any) = jest.fn().mockImplementation(() => {
                return {
                    get: jest.fn().mockReturnValue(undefined)
                };
            });
            const mockShow = jest.fn();
            const mockStatusBarItem = {
                text: "",
                show: mockShow,
            };
            (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);

            let docDatabaseStatusBar = new DatabaseStatusBarItem(new documentDatabase.DocumentDatabaseBindings());
            docDatabaseStatusBar.update();

            expect(mockShow).toHaveBeenCalled();
            expect(mockStatusBarItem.text.toLowerCase()).toContain(noDatabaseText);
        });
    });
});
