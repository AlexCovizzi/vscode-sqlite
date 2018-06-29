import { TreeDataProvider, Event, TreeItem, EventEmitter } from "vscode";
import { SQLItem, DBItem, TableItem, ColumnItem } from "./treeItem";
import { QueryRunner } from "../database/queryRunner";

export class ExplorerTreeProvider implements TreeDataProvider<SQLItem> {

    private _onDidChangeTreeData: EventEmitter<SQLItem | undefined> = new EventEmitter<SQLItem | undefined>();
    readonly onDidChangeTreeData: Event<SQLItem | undefined> = this._onDidChangeTreeData.event;

    private dbs: string[] = [];

    constructor(private queryRunner: QueryRunner) {
    }
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    addToTree(dbPath: string) {
        let isNew = this.dbs.findIndex(db => db === dbPath) < 0;
        if (isNew) {
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

    getDbs() {
        return this.dbs;
    }

    getChildren(element?: SQLItem): Thenable<SQLItem[]> {
        return new Promise( (resolve, reject) => {
            if (element) {
                if (element instanceof DBItem) {
                    const query = `SELECT name FROM sqlite_master WHERE type="table" ORDER BY name ASC;`;
                    this.queryRunner.runQuery(element.dbPath, query).then(
                        resultSet => {
                            let tableItems: TableItem[] = [];
                            
                            if (resultSet.length > 0) {
                                resultSet[0].rows.forEach((row) => {
                                    let tableItem = new TableItem(element, row[0]);
                                    tableItems.push(tableItem);
                                });
                            }
                            resolve(tableItems);
                        },
                        err => {
                            resolve([]);
                        }
                    );
                } else if (element instanceof TableItem) {
                    let query = `PRAGMA table_info(${element.label});`;
                    this.queryRunner.runQuery(element.parent.dbPath, query).then(
                        resultSet => {
                            let columnItems: ColumnItem[] = [];

                            if (resultSet.length > 0) {
                                let result = resultSet[0];
                                result.rows.forEach((row) => {
                                    let colName = row[result.header.indexOf('name')];
                                    let colType = row[result.header.indexOf('type')].toUpperCase();
                                    let colNotNull = row[result.header.indexOf('notnull')] === '1' ? true : false;
                                    let colPk = Number(row[result.header.indexOf('pk')]) || 0;
                                    let colDefVal = row[result.header.indexOf('dflt_value')];
                                    let columnItem = new ColumnItem(
                                        element,
                                        colName,
                                        colType,
                                        colNotNull,
                                        colPk,
                                        colDefVal
                                    );
                                    columnItems.push(columnItem);
                                });
                            }
                            resolve(columnItems);
                        },
                        err => {
                            resolve([]);
                        }
                    );
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