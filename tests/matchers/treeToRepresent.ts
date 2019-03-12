import { TreeDataProvider, TreeItem } from "vscode";
import { Fixture } from "../fixtures";

export interface TreeNodeRepr extends TreeItem {
    children: TreeNodeRepr[];
}

export interface TreeRootRepr {
    children: TreeNodeRepr[];
}

const IGNORE_CASE = true;
const IGNORE_TOOLTIP = true;

expect.extend({
    async toRepresent(treeDataProvider: TreeDataProvider<any>, databases: Fixture.Database[]) {
        let filter = (item: TreeRootRepr|TreeNodeRepr): TreeNodeRepr|TreeRootRepr => {
            let obj: TreeNodeRepr|TreeRootRepr;
            if ("label" in item) {
                let label = IGNORE_CASE? item.label.toLowerCase() : item.label;
                let tooltip = IGNORE_TOOLTIP? undefined : (IGNORE_CASE && item.tooltip? item.tooltip.toLowerCase() : item.tooltip);
                obj = {label: label, tooltip: tooltip, children: []};
            } else {
                obj = {children: []};
            }
            for(let child of item.children) obj.children.push(filter(child) as TreeNodeRepr);
            return obj;
        };

        let receivedTree: TreeRootRepr = await objectifyTree(treeDataProvider);
        receivedTree = filter(receivedTree);

        let expectedTree: TreeRootRepr = {children: databases.map(db => getTreeRepr(db))};
        expectedTree = filter(expectedTree);

        let pass = JSON.stringify(receivedTree) === JSON.stringify(expectedTree);
        if (pass) {
            return {
              message: () =>
                `expected:\n${JSON.stringify(expectedTree, null, 2)}\nreceived:\n${JSON.stringify(receivedTree, null, 2)}`,
              pass: true,
            };
        } else {
            return {
              message: () =>
                `expected:\n${JSON.stringify(expectedTree, null, 2)}\nreceived:\n${JSON.stringify(receivedTree, null, 2)}`,
              pass: false,
            };
        }
    }
});

export function getTreeRepr(database: Fixture.Database): TreeNodeRepr {
    let repr: TreeNodeRepr = {
        label: database.name,
        tooltip: database.path,
        children: database.tables.map(tb => ({
            label: tb.name,
            tooltip: undefined, // TODO: test tooltip
            children: tb.columns.map(col => ({
                label: `${col.name} : ${col.type}`,
                tooltip: undefined, // TODO: test tooltip
                children: []
            }))
        }))
    }
    return repr;
}

export async function objectifyTree(treeDataProvider: TreeDataProvider<any>) {
    let root = {
        children: []
    };

    async function getChildren(parent: {children: TreeNodeRepr[]}, element?: any) {
        let treeItem;
        if (element) {
            treeItem = await treeDataProvider.getTreeItem(element);
            treeItem["children"] = [];
            parent.children.push(treeItem as TreeNodeRepr);
        } else {
            treeItem = parent;
        }

        let children = await treeDataProvider.getChildren(element);
        if (children.length === 0) {
            // this is a leaf, end recursion
            return;
        }

        for(let child of children) {
            await getChildren(treeItem as {children: []}, child);
        }
    }

    await getChildren(root);

    return root;
}