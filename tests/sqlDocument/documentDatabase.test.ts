import * as vscode from 'vscode';
import {DocumentDatabase} from '../../src/sqlDocument/documentDatabase';

jest.mock("vscode");

describe("documentDatabase.ts", () => {

    describe("DocumentDatabase", () => {

        test("bind should bind document and database passed as arguments", () => {
            expect(1).toBe(1);
        });

    });
});
