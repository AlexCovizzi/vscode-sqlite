import { TreeDataProvider, Event, TreeItem, EventEmitter, ProviderResult } from "vscode";
import { DBItem, TableItem, ColumnItem } from "./treeItem";
import { Schema } from "../interfaces";


export class ExplorerTreeProvider implements TreeDataProvider<Schema.Item> {

    private _onDidChangeTreeData: EventEmitter<Schema.Item | undefined> = new EventEmitter<Schema.Item | undefined>();
    readonly onDidChangeTreeData: Event<Schema.Item | undefined> = this._onDidChangeTreeData.event;

    private databaseList: Schema.Database[];

    constructor() {
        this.databaseList = [];
    }
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    addToTree(database: Schema.Database) {
        let index = this.databaseList.findIndex(db => db.path === database.path);
        if (index < 0) {
            this.databaseList.push(database);
        } else {
            this.databaseList[index] = database;
        }
        this.refresh();
        return this.databaseList.length;
    }

    removeFromTree(dbPath: string) {
        let index = this.databaseList.findIndex(db => db.path === dbPath);
        if (index > -1) {
            this.databaseList.splice(index, 1);
        }
        this.refresh();
        
        return this.databaseList.length;
    }
    
    getTreeItem(item: Schema.Item): TreeItem {
        if ('tables' in item) {
            // Database
            return new DBItem(item.path);
        } else if ('columns' in item) {
            // Table
            return new TableItem(item.name);
        } else {
            // Column
            return new ColumnItem(item.name, item.type, item.notnull, item.pk, item.defVal);
        }
    }

    getDatabaseList() {
        return this.databaseList;
    }

    getChildren(item?: Schema.Item): ProviderResult<Schema.Item[]> {
        if (item) {
            if ('tables' in item) {
                // Database
                return item.tables;
            } else if ('columns' in item) {
                // Table
                return item.columns;
            } else {
                // Column
                return [];
            }
        } else {
            // Root
            return this.databaseList;
        }
    }

}