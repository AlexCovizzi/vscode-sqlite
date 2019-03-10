import vscode = require('vscode');
import * as extension from "../../src/extension";
import { Commands } from "../../src/extension";
import { Constants } from "../../src/constants/constants";
import { join } from 'path';
import sqlite3 = require('sqlite3');
import { getMockCallWhereParamEquals } from '../helpers/mockHelper';
import { getRegisteredCommandCallback } from '../helpers/vscodeHelper';
import { Fixture } from '../fixtures';
import { createDatabase, removeDatabase } from '../helpers/fixtureHelper';

jest.mock('vscode');

describe(`Command: ${Commands.explorerRefresh}`, () => {
    let treeDataProvider: vscode.TreeDataProvider<any>;
    let explorerAddCallback: any;
    let explorerRefreshCallback: any;

    beforeAll(async () => {
        //
    });

    afterAll(async () => {
        //
    });

    beforeEach(async () => {
        let context: any = {subscriptions: [], extensionPath: join(__dirname, "..", "..")};
        await extension.activate(context);

        // retrieve the tree data provider created in activate() with name Constants.sqliteExplorerViewId
        let createTreeViewCall = getMockCallWhereParamEquals((vscode.window.createTreeView as jest.Mock).mock, 0, Constants.sqliteExplorerViewId);
        treeDataProvider = createTreeViewCall[1].treeDataProvider;
        // retrieve callback for the registered commands
        explorerAddCallback = getRegisteredCommandCallback(Commands.explorerAdd);
        explorerRefreshCallback = getRegisteredCommandCallback(Commands.explorerRefresh);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`command ${Commands.explorerRefresh} should update the explorer tree with the table added to the database`, async () => {
        expect.assertions(2);

        let databaseFixture = Fixture.getDatabase(Fixture.DATABASE_MAIN);
        await createDatabase(databaseFixture);
    
        
        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);
        
        // add a table to the database
        databaseFixture = await new Promise((resolve, reject) => {
            let table = {
                name: "added_table", 
                columns: [
                    {name: "id", type: "TEXT", notnull: true, pk: 1},
                    {name: "name", type: "TEXT", notnull: false, pk: 0}
                ],
                records: []
            };
            databaseFixture.tables.push(table);

            let db = new sqlite3.Database(databaseFixture.path, (err) => {
                if (err) reject(err);
            });
            
            let stmt = `CREATE TABLE IF NOT EXISTS ${table.name}`;
            stmt += `(`;
            for(let j=0; j<table.columns.length; j++) {
                let col = table.columns[j];
                stmt += `${col.name} ${col.type} ${col.notnull? 'NOT NULL' : ''} ${col.pk>0? 'PRIMARY KEY' : ''}`;
                if (j < table.columns.length-1) stmt += `,`;
            }
            stmt += `)`;
            db.serialize(function() {
                db.run(stmt, (err) => {
                    if (err) reject(err);
                });
            });
            
            db.close((err) => {
                if (err) reject(err);
                else resolve(databaseFixture);
            });
        });
        
        await explorerRefreshCallback();

        // make sure the treeDataProvider updates the tree 2 times (when adding the database and when refreshing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        await expect(treeDataProvider).toInclude(databaseFixture);
        
        await removeDatabase(databaseFixture);
    });

    test(`command ${Commands.explorerRefresh} should remove the database from the explorer and show an error if it fails to retrieve the database schema`, async () => {
        expect.assertions(3);

        let databaseFixture = Fixture.getDatabase(Fixture.DATABASE_EMPTY);
        await createDatabase(databaseFixture);
        
        // this is the uri of the database we are opening
        let uri = {scheme: "file", fsPath: databaseFixture.path};

        await explorerAddCallback(uri);

        // remove database from files
        await removeDatabase(databaseFixture);

        await explorerRefreshCallback();

        expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
        
        // make sure the treeDataProvider updates the tree 2 times (when adding the database and when removing it)
        expect(treeDataProvider.onDidChangeTreeData).toHaveBeenCalledTimes(2);

        await expect(treeDataProvider).not.toInclude(databaseFixture);
    });

});