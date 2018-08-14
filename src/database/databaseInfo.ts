import { QueryRunner } from "./queryRunner";

export class DatabaseInfo {
    private _tables?: TableInfo[];

    constructor(private queryRunner: QueryRunner, public dbPath: string) {
    }

    reset() {
        this._tables = undefined;
    }

    tables(): PromiseLike<TableInfo[]> {
        if (this._tables === undefined) {
            const query = `SELECT name FROM sqlite_master WHERE type="table" ORDER BY name ASC;`;
            return new Promise((resolve, reject) => {
                this.queryRunner.runQuery(this.dbPath, query, (resultSet?, err?) => {
                    if (resultSet) {
                        let tables: string[] = [];
                        if (resultSet.length > 0) {
                            resultSet[0].rows.forEach(row => {
                                tables.push(row[0]);
                            });
                        }
                        this._tables = tables.map(tbl => new TableInfo(this.queryRunner, this.dbPath, tbl));
                        resolve(this._tables);
                    } else {
                        resolve([])
                    }
                });
            });
        } else {
            return Promise.resolve(this._tables);
        }
    }
}

export class TableInfo {
    private _columns?: ColumnInfo[];

    constructor(private queryRunner: QueryRunner, public dbPath: string, public name: string) {
    }

    columns(): PromiseLike<ColumnInfo[]> {
        if (this._columns === undefined) {
            let query = `PRAGMA table_info(${this.name});`;
            return new Promise((resolve, reject) => {
                this.queryRunner.runQuery(this.dbPath, query, (resultSet?, err?) => {
                    if (resultSet) {
                        let cols: ColumnInfo[] = [];

                        if (resultSet.length > 0) {
                            let result = resultSet[0];
                            result.rows.forEach((row) => {
                                let colName = row[result.header.indexOf('name')];
                                let colType = row[result.header.indexOf('type')].toUpperCase();
                                let colNotNull = row[result.header.indexOf('notnull')] === '1' ? true : false;
                                let colPk = Number(row[result.header.indexOf('pk')]) || 0;
                                let colDefVal = row[result.header.indexOf('dflt_value')];
                                cols.push(new ColumnInfo(this.dbPath, this.name, colName, 
                                                        colType, colNotNull, colPk, colDefVal));
                            });
                        }
                        this._columns = cols;

                        resolve(this._columns);
                    } else {
                        resolve([]);
                    }
                });
            });
        } else {
            return Promise.resolve(this._columns);
        }
    }
}

export class ColumnInfo {

    constructor(public dbPath: string, public tableName: string,
            public name: string, public type: string,
            public notnull: boolean, public pk: number, public defVal: string) {
        
    }

}