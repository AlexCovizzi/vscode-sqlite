import * as vscode from "vscode";
import { DatabaseFixture } from "../helpers/fixtureHelper";

export async function expectDatabaseFixtureAddedToTree(databaseFixture: DatabaseFixture, treeDataProvider: vscode.TreeDataProvider<any>) {
    let databaseTreeChildren = await treeDataProvider.getChildren();
    let databaseTreeItems = await Promise.all(databaseTreeChildren.map(child => treeDataProvider.getTreeItem(child)));
    let databaseTreeItemIndex = databaseTreeItems.findIndex(item => item.label === databaseFixture.name);
    let databaseTreeItem = databaseTreeItems[databaseTreeItemIndex];
    let databaseTreeChild = databaseTreeChildren[databaseTreeItemIndex];
    expect(databaseTreeChild).toBeDefined();
    expect(databaseTreeItem.label).toBe(databaseFixture.name);
    expect(databaseTreeItem.tooltip).toBe(databaseFixture.path);

    let tableTreeChildren = await treeDataProvider.getChildren(databaseTreeChild);
    let tableTreeItems = await Promise.all(tableTreeChildren.map(child => treeDataProvider.getTreeItem(child)));
    // make sure every table in the fake database has the corresponding table tree item
    // we check that the list of the labels of the table tree items includes the i-th table name
    for(let i=0; i<databaseFixture.tables.length; i++) {
        let table = databaseFixture.tables[i];
        expect(tableTreeItems.map(item => item.label)).toContain(table.name);
    }

    let columnTreeChildren = await Promise.all(tableTreeChildren.map(child => treeDataProvider.getChildren(child)));
    for(let i=0; i<columnTreeChildren.length; i++) {
        let table = databaseFixture.tables[i];
        let tableColumnTreeItems = await Promise.all(columnTreeChildren[i].map(child => treeDataProvider.getTreeItem(child)));
        // make sure every column of the i-th table in the fake database has the corresponding column tree item
        // we check that the list of the labels of the columns of the i-th table tree item includes the j-th column name and type
        for(let j=0; j<table.columns.length; j++) {
            let column = table.columns[j];
            expect(tableColumnTreeItems.map(item => item.label)).toContain(`${column.name} : ${column.type.toLowerCase()}`);
            // TODO: test tooltip??
        }
    }
}