import * as vscode from 'vscode';
import * as sqlDocument from '../../src/sqlDocument/sqlDocument';
import * as documentDatabase from '../../src/sqlDocument/documentDatabase';
import { DocumentDatabaseStatusBar } from '../../src/statusBar/docDatabaseStatusBar';

jest.mock("vscode");
jest.mock("../../src/sqlDocument/sqlDocument");
jest.mock("../../src/sqlDocument/documentDatabase");

describe("docDatabaseStatusBar.ts", () => {

    describe("DocumentDatabaseStatusBar", () => {

        test("update should hide the status bar item if the editor document is not sql", () => {
            // getEditorSqlDocument returns undefined when the editor document is not sql
            (sqlDocument.getEditorSqlDocument as jest.Mock).mockReturnValue(undefined);
            const mockHide = jest.fn();
            (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue({
                hide: mockHide
            });

            let docDatabaseStatusBar = new DocumentDatabaseStatusBar(new documentDatabase.DocumentDatabase());
            docDatabaseStatusBar.update();
            expect(mockHide).toHaveBeenCalled();
        });

        test("update should show the status bar item and change text to contain db path if the editor document is a sql document with a database", () => {
            const dbPath = "fake_dbPath";
            // getEditorSqlDocument returns a truthy value, i dont care about the actual document
            (sqlDocument.getEditorSqlDocument as jest.Mock).mockReturnValue(true);
            (documentDatabase.DocumentDatabase as any) = jest.fn().mockImplementation(() => {
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

            let docDatabaseStatusBar = new DocumentDatabaseStatusBar(new documentDatabase.DocumentDatabase());
            docDatabaseStatusBar.update();

            expect(mockShow).toHaveBeenCalled();
            expect(mockStatusBarItem.text).toContain(dbPath);
        });

        test("update should show the status bar item and change text to contain 'no database' if the editor document is a sql document without a database", () => {
            const noDatabaseText = "no database";
            // getEditorSqlDocument returns a truthy value, i dont care about the actual document
            (sqlDocument.getEditorSqlDocument as jest.Mock).mockReturnValue(true);
            (documentDatabase.DocumentDatabase as any) = jest.fn().mockImplementation(() => {
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

            let docDatabaseStatusBar = new DocumentDatabaseStatusBar(new documentDatabase.DocumentDatabase());
            docDatabaseStatusBar.update();

            expect(mockShow).toHaveBeenCalled();
            expect(mockStatusBarItem.text.toLowerCase()).toContain(noDatabaseText);
        });
    });
});
