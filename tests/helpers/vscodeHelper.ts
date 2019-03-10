import * as vscode from "vscode";
import { getMockCallWhereParamEquals } from "./mockHelper";

interface TreeItem extends vscode.TreeItem {
    children: vscode.TreeItem[];
}

interface TreeRoot {
    children: TreeItem[];
}

export function getRegisteredCommandCallback(command: string) {
    let call = getMockCallWhereParamEquals((vscode.commands.registerCommand as jest.Mock).mock, 0, command);
    return call[1];
}

export async function objectifyTree(treeDataProvider: vscode.TreeDataProvider<any>): Promise<TreeRoot> {
    let root = {
        children: []
    };

    async function getChildren(parent: {children: TreeItem[]}, element?: any) {
        let treeItem;
        if (element) {
            treeItem = await treeDataProvider.getTreeItem(element);
            treeItem["children"] = [];
            parent.children.push(treeItem as TreeItem);
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