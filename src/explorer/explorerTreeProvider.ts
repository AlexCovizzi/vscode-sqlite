import { TreeDataProvider, Event, TreeItem, EventEmitter } from "vscode";
import { DatabaseStore } from "../database/databaseStore";
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
    
    addToTree(dbPath: string) {
        let database = this.databaseStore.getDatabase(dbPath);
        let isNew = this.dbs.findIndex(db => db === dbPath) < 0;
        if (database && isNew) {
            this.dbs.push(dbPath);
            this.refresh();
            return true;
        }
        return false;
    }

    removeFromTree(dbPath: string) {
        let index = this.dbs.findIndex(db => db === dbPath);
        if (index > -1) {
            this.dbs.splice(index, 1);
        }
        this.refresh();
        
        return this.dbs.length;
    }
    
    getTreeItem(element: SQLItem): TreeItem {
        return element;
    }

    getChildren(element?: SQLItem): Thenable<SQLItem[]> {
        return new Promise( (resolve, reject) => {
            if (element) {
                if (element instanceof DBItem) {
                    let database = this.databaseStore.getDatabase(element.dbPath);
                    if (database) {
                        database.exec(`SELECT name FROM sqlite_master WHERE type="table";`, (resultSet) => {
                            let tableItems: TableItem[] = [];
            
                            resultSet[0].rows.forEach((row) => {
                                let tableItem = new TableItem(element, row[0]);
                                tableItems.push(tableItem);
                            });
                            resolve(tableItems);
                        });
                    }
                } else if (element instanceof TableItem) {
                    let database = this.databaseStore.getDatabase(element.parent.dbPath);
                    if (database) {
                        let query = `PRAGMA table_info(${element.label});`;
                        database.exec(query, (resultSet) => {
                            resultSet.forEach( (result, index) => {
                                let columnItems: ColumnItem[] = [];
                                result.rows.forEach((row) => {
                                    let columnItem = new ColumnItem(
                                        element,
                                        row[result.header.indexOf('name')],
                                        row[result.header.indexOf('type')].toUpperCase(),
                                        row[result.header.indexOf('notnull')] === '1' ? true : false,
                                        row[result.header.indexOf('pk')] === '1' ? true : false
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