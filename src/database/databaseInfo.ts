import { QueryRunner } from "./queryRunner";

/**
 * Contains info about the database.
 */
export class DatabaseInfo {
    private _tables?: TableInfo[];

    constructor(private queryRunner: QueryRunner, public dbPath: string) {
    }

    /**
     * Load tables and columns info for this database.
     */
    load(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.tables().forEach(tbl => tbl.columns());
            resolve();
        });
    }

    /**
     * Unload tables and columns info for this database.
     */
    unload() {
        this._tables = undefined;
    }

    /**
     * Unload and then load tables and columns info for this database.
     */
    reload(): Promise<void> {
        this.unload();
        return this.load();
    }

    /**
     * Return tables info for this database.
     * If not already loaded they will be loaded synchronously.
     */
    tables(): TableInfo[] {
        if (this._tables === undefined) {
            const query = `SELECT name FROM sqlite_master WHERE type="table" ORDER BY name ASC;`;
            let resultSet = this.queryRunner.runQuerySync(this.dbPath, query);
            if (resultSet instanceof Error) {
                this._tables = [];
            } else {
                let tables: string[] = [];
                if (resultSet.length > 0) {
                    resultSet[0].rows.forEach(row => {
                        tables.push(row[0]);
                    });
                }
                this._tables = tables.map(tbl => new TableInfo(this.queryRunner, this.dbPath, tbl));
            }
        }
        return this._tables;
    }
}

export class TableInfo {
    private _columns?: ColumnInfo[];

    constructor(private queryRunner: QueryRunner, public dbPath: string, public name: string) {
    }

    columns(): ColumnInfo[] {
        if (this._columns === undefined) {
            let query = `PRAGMA table_info(${this.name});`;
            let resultSet = this.queryRunner.runQuerySync(this.dbPath, query);
            if (resultSet instanceof Error) {
                this._columns = [];
            } else {
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
            }
        }
        return this._columns;
    }
}

export class ColumnInfo {

    constructor(public dbPath: string, public tableName: string,
            public name: string, public type: string,
            public notnull: boolean, public pk: number, public defVal: string) {
        
    }

}