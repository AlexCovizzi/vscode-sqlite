import { TreeDataProvider, Event, TreeItem, EventEmitter, ProviderResult } from "vscode";
import { DBItem, TableItem, ColumnItem } from "./treeItem";
import { QueryRunner } from "../database/queryRunner";
import { DatabaseInfo, TableInfo, ColumnInfo } from "../database/databaseInfo";

type ItemInfo = DatabaseInfo | TableInfo | ColumnInfo;

export class ExplorerTreeProvider implements TreeDataProvider<ItemInfo> {

    private _onDidChangeTreeData: EventEmitter<ItemInfo | undefined> = new EventEmitter<ItemInfo | undefined>();
    readonly onDidChangeTreeData: Event<ItemInfo | undefined> = this._onDidChangeTreeData.event;

    private databaseInfoList: DatabaseInfo[] = [];

    constructor(private queryRunner: QueryRunner) {
    }
    
    refresh(): void {
        this.databaseInfoList.forEach(dbInfo => dbInfo.reset());
        this._onDidChangeTreeData.fire();
    }

    addToTree(dbPath: string) {
        let isNew = this.databaseInfoList.findIndex(dbInfo => dbInfo.dbPath === dbPath) < 0;
        if (isNew) {
            let databaseInfo = new DatabaseInfo(this.queryRunner, dbPath);
            this.databaseInfoList.push(databaseInfo);
            this.refresh();
            return true;
        }
        return false;
    }

    removeFromTree(dbPath: string) {
        let index = this.databaseInfoList.findIndex(dbInfo => dbInfo.dbPath === dbPath);
        if (index > -1) {
            this.databaseInfoList.splice(index, 1);
        }
        this.refresh();
        
        return this.databaseInfoList.length;
    }
    
    getTreeItem(element: ItemInfo): TreeItem {
        if (element instanceof DatabaseInfo) {
            return new DBItem(element.dbPath);
        }
        if (element instanceof TableInfo) {
            return new TableItem(element.name);
        }
        if (element instanceof ColumnInfo) {
            return new ColumnItem(element.name, element.type, element.notnull, element.pk, element.defVal);
        }
        return new TreeItem('No value');
    }

    getDatabases() {
        return this.databaseInfoList.map(dbInfo => dbInfo.dbPath);
    }

    getChildren(element?: ItemInfo): ProviderResult<ItemInfo[]> {
        if (element) {
            if (element instanceof DatabaseInfo) {
                return element.tables();
            }
            if (element instanceof TableInfo) {
                return element.columns();
            }
            if (element instanceof ColumnInfo) {
                return [];
            }
        } else {
            return this.databaseInfoList;
        }
    }

}