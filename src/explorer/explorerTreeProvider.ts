import { TreeDataProvider, Event, TreeItem, EventEmitter, ProviderResult } from "vscode";
import { DBItem, TableItem, ColumnItem } from "./treeItem";

export interface Database { path: string; tables: Table[]; }
interface Table { name: string; columns: Column[]; }
interface Column { name: string; type: string; notnull: boolean; pk: number; defVal: string; }
type Item = Database | Table | Column;


export class ExplorerTreeProvider implements TreeDataProvider<Item> {

    private _onDidChangeTreeData: EventEmitter<Item | undefined> = new EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: Event<Item | undefined> = this._onDidChangeTreeData.event;

    private databaseList: Database[];

    constructor() {
        this.databaseList = [];
    }
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    addToTree(database: Database) {
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
    
    getTreeItem(item: Item): TreeItem {
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

    getChildren(item?: Item): ProviderResult<Item[]> {
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