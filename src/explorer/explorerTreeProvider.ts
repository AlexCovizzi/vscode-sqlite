import { TreeDataProvider, Event, TreeItem, EventEmitter, commands } from "vscode";
import { DatabaseStore } from "../models/databaseStore";
import { SQLItem, DBItem, TableItem, ColumnItem } from "./treeItem";

export class ExplorerTreeProvider implements TreeDataProvider<SQLItem> {

    private _onDidChangeTreeData: EventEmitter<SQLItem | undefined> = new EventEmitter<SQLItem | undefined>();
    readonly onDidChangeTreeData: Event<SQLItem | undefined> = this._onDidChangeTreeData.event;

    private dbs: string[] = [];

    constructor(private databaseStore: DatabaseStore) {
    }
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    
    add(dbPath: string) {
        let database = this.databaseStore.get(dbPath);
        if (database && this.dbIndex(dbPath) < 0) {
            this.dbs.push(dbPath);
            this.refresh();
            return true;
        }
        return false;
    }

    remove(dbPath: string) {
        let index = this.dbIndex(dbPath);
        if (index > -1) {
            this.dbs.splice(index, 1);
        }
        this.refresh();
        
        return this.dbs.length;
    }

    private dbIndex(dbPath: string) {
        return this.dbs.findIndex(db => db === dbPath);
    }
    
    getTreeItem(element: SQLItem): TreeItem {
        return element;
    }

    getChildren(element?: SQLItem): Thenable<SQLItem[]> {
        return new Promise( (resolve, reject) => {
            if (element) {
                if (element instanceof DBItem) {
                    let database = this.databaseStore.get(element.dbPath);
                    if (database) {
                        database.exec(`SELECT name FROM sqlite_master WHERE type="table";`, (resultSet, err) => {
                            if (err) {
                                console.log("Error: " + err.message);
                            } else {
                                let tableItems: TableItem[] = [];
                
                                resultSet[0].rows.forEach((row) => {
                                    let tableItem = new TableItem(element, row["name"]);
                                    tableItems.push(tableItem);
                                });
                                resolve(tableItems);
                            }
                        });
                    }
                } else if (element instanceof TableItem) {
                    let database = this.databaseStore.get(element.parent.dbPath);
                    if (database) {
                        let query = `PRAGMA table_info(${element.label});`;
                        database.exec(query, (resultSet, err) => {
                    
                            resultSet.forEach( (result, index) => {
                                let columnItems: ColumnItem[] = [];
                                result.rows.forEach((row) => {
                                    let columnItem = new ColumnItem(
                                        element,
                                        row["name"],
                                        row["type"].toUpperCase(),
                                        row["dflt_value"],
                                        row["notnull"] === '1' ? true : false,
                                        row["pk"] === '1' ? true : false
                                    );
                                    columnItems.push(columnItem);
                                });
                                resolve(columnItems);
                            });
                        });
                    }
                } else if (element instanceof ColumnItem) {
                    resolve([]);
                }
            } else {
                let dbItems: DBItem[] = [];
                this.dbs.forEach(dbPath => {
                    dbItems.push(new DBItem(dbPath));
                });
                resolve(dbItems);
            }
        });
    }

    
}