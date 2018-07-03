import { TreeDataProvider, Event, TreeItem, EventEmitter } from "vscode";
import { SQLItem, DBItem, TableItem, ColumnItem } from "./treeItem";
import { QueryRunner } from "../database/queryRunner";
import { DatabaseInfo } from "../database/databaseInfo";

export class ExplorerTreeProvider implements TreeDataProvider<SQLItem> {

    private _onDidChangeTreeData: EventEmitter<SQLItem | undefined> = new EventEmitter<SQLItem | undefined>();
    readonly onDidChangeTreeData: Event<SQLItem | undefined> = this._onDidChangeTreeData.event;

    private databaseInfoList: DatabaseInfo[] = [];

    constructor(private queryRunner: QueryRunner) {
    }
    
    refresh(): void {
        this.databaseInfoList.forEach(dbInfo => dbInfo.unload());
        this._onDidChangeTreeData.fire();
    }

    addToTree(dbPath: string) {
        let isNew = this.databaseInfoList.findIndex(dbInfo => dbInfo.dbPath === dbPath) < 0;
        if (isNew) {
            let databaseInfo = new DatabaseInfo(this.queryRunner, dbPath);
            this.databaseInfoList.push(databaseInfo);
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
    
    getTreeItem(element: SQLItem): TreeItem {
        return element;
    }

    getDatabases() {
        return this.databaseInfoList.map(dbInfo => dbInfo.dbPath);
    }

    getChildren(element?: SQLItem): Thenable<SQLItem[]> {
        return new Promise( (resolve, reject) => {
            if (element) {
                if (element instanceof DBItem) {
                    let items: TableItem[] = [];
                    let dbInfo = this.databaseInfoList.find(dbInfo => dbInfo.dbPath === element.dbPath);
                    if (dbInfo) {
                        items = dbInfo.tables().map(tblInfo => new TableItem(element, tblInfo.name));
                    }
                    resolve(items);
                } else if (element instanceof TableItem) {
                    let items: ColumnItem[] = [];
                    let dbInfo = this.databaseInfoList.find(dbInfo => dbInfo.dbPath === element.parent.dbPath);
                    if (dbInfo) {
                        let tableInfo = dbInfo.tables().find(tblInfo => tblInfo.name === element.label);
                        if (tableInfo) {
                            items = tableInfo.columns().map(colInfo => {
                                return new ColumnItem(element, colInfo.name, colInfo.type,
                                    colInfo.notnull, colInfo.pk, colInfo.defVal );
                            });
                        }
                    }
                    resolve(items);
                } else {
                    resolve([]);
                }
            } else {
                let items: DBItem[] = [];
                items = this.databaseInfoList.map(dbInfo => new DBItem(dbInfo.dbPath));
                resolve(items);
            }
        });
    }

}