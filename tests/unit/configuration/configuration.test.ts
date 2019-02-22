import * as vscode from 'vscode';
import { getConfiguration } from "../../../src/configuration";
import { Level } from "../../../src/logging/logger";

jest.mock("vscode");
//jest.mock("../../src/utils/cmdSqlite3Utils");

describe("configuration", () => {

    describe("getConfiguration", () => {

        test("recordsPerPage should return the value supplied if its valid", () => {
            let recordsPerPage = 0;

            (vscode.workspace.getConfiguration as any) = jest.fn(() => {
                return {
                    get: (s: any) => recordsPerPage.toString()
                };
            });
            
            let configuration = getConfiguration();

            expect(configuration.recordsPerPage).toBe(recordsPerPage);
        });

        test("recordsPerPage should return the default value if the value supplied is not valid", () => {
            let recordsPerPage = "abc";

            (vscode.workspace.getConfiguration as any) = jest.fn(() => {
                return {
                    get: (s: any) => recordsPerPage.toString()
                };
            });
            
            let configuration = getConfiguration();
            let expected = require('../../../package.json').contributes.configuration.properties["sqlite.recordsPerPage"]["default"];

            expect(configuration.recordsPerPage).toBe(expected);

        });

        test("logLevel should return the value supplied its valid", () => {
            let logLevel = Level.DEBUG;

            (vscode.workspace.getConfiguration as any) = jest.fn(() => {
                return {
                    get: (s: any) => logLevel
                };
            });
            
            let configuration = getConfiguration();

            expect(configuration.logLevel).toBe(logLevel);
        });


        test("logLevel should return the default value if the value supplied is not valid", () => {
            let expected = require('../../../package.json').contributes.configuration.properties["sqlite.logLevel"]["default"];

            (vscode.workspace.getConfiguration as any) = jest.fn(() => {
                return {
                    get: (s: any) => "level not valid"
                };
            });
            
            let configuration = getConfiguration();

            expect(configuration.logLevel).toBe(expected);
        });

        /*
        test("sqlite3 should return the value supplied if it's valid", () => {
            let sqlite3 = "sqlite3";

            (vscode.workspace.getConfiguration as any) = jest.fn(() => {
                return {
                    get: (s: any) => sqlite3
                };
            });
            (sqlite3Utils.validateOrFallback as any) = jest.fn().mockReturnValue(sqlite3);
            
            let configuration = getConfiguration("");

            expect(configuration.sqlite3).toBe(sqlite3);
        });

        test("sqlite3 should return an empty string if validateOrFallback returns undefined", () => {
            (vscode.workspace.getConfiguration as any) = jest.fn(() => {
                return {
                    get: (s: any) => "whatever"
                };
            });
            (sqlite3Utils.validateOrFallback as any) = jest.fn().mockReturnValue(undefined);
            
            let configuration = getConfiguration("");

            expect(configuration.sqlite3).toBe("");
        });
        */
    });
});