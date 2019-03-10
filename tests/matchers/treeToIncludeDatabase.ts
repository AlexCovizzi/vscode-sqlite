import * as vscode from "vscode";
import { Fixture } from "../fixtures";

expect.extend({
    async toInclude(treeDataProvider: vscode.TreeDataProvider<any>, databaseFixture: Fixture.Database) {
        // sort tables by name
        databaseFixture.tables.sort(((a, b) => a.name > b.name? 1 : -1));

        let databaseTreeChildren = await treeDataProvider.getChildren();
        let databaseTreeItems = await Promise.all(databaseTreeChildren.map(child => treeDataProvider.getTreeItem(child)));
        let databaseTreeItemIndex = databaseTreeItems.findIndex(item => item.label === databaseFixture.name);
        let databaseTreeItem = databaseTreeItems[databaseTreeItemIndex];
        let databaseTreeChild = databaseTreeChildren[databaseTreeItemIndex];

        if (!databaseTreeChild) {
            // the tree does not have any database with the same name as the database passed
            return {
                message: () => `expected database '${databaseFixture.name}' to be added to the tree`,
                pass: false,
            };
        } else {
            if (this.isNot) {
                return {
                    message: () => `expected database '${databaseFixture.name}' to not be added to the tree`,
                    pass: true,
                };
            }
        }
        
        if (databaseTreeItem.tooltip !== databaseFixture.path) {
            // the tree does not have a tooltip with the path of the database
            return {
                message: () => `expected tree item to have tooltip with path '${databaseFixture.path}'`,
                pass: false,
            };
        }

        let tableTreeChildren = await treeDataProvider.getChildren(databaseTreeChild);
        let tableTreeItems = await Promise.all(tableTreeChildren.map(child => treeDataProvider.getTreeItem(child)));
        // make sure every table in the fake database has the corresponding table tree item
        // we check that the list of the labels of the table tree items includes the i-th table name
        for(let i=0; i<databaseFixture.tables.length; i++) {
            let table = databaseFixture.tables[i];
            let tableItemLabels = tableTreeItems.map(item => item.label);
            if (tableItemLabels.indexOf(table.name) < 0) {
                return {
                    message: () => `expected table lables [${tableItemLabels}] to include '${table.name}'`,
                    pass: false,
                };
            }
        }

        let columnTreeChildren = await Promise.all(tableTreeChildren.map(child => treeDataProvider.getChildren(child)));
        for(let i=0; i<columnTreeChildren.length; i++) {
            let table = databaseFixture.tables[i];
            let tableColumnTreeItems = await Promise.all(columnTreeChildren[i].map(child => treeDataProvider.getTreeItem(child)));
            // make sure every column of the i-th table in the fake database has the corresponding column tree item
            // we check that the list of the labels of the columns of the i-th table tree item includes the j-th column name and type
            for(let j=0; j<table.columns.length; j++) {
                let column = table.columns[j];
                // TODO: test tooltip??
                let colLabel = `${column.name} : ${column.type.toLowerCase()}`;
                let colItemLabels = tableColumnTreeItems.map(item => item.label);
                if (colItemLabels.indexOf(colLabel) < 0) {
                    return {
                        message: () => `expected table '${table.name}' column labels [${colItemLabels}] to include '${colLabel}'`,
                        pass: false,
                    };
                }
            }
        }

        return {
            message: () => `expected database '${databaseFixture.name}' to not be added to the tree`,
            pass: true,
        };
    }
});
