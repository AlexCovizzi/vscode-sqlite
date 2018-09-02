import { execute } from "./sqlite3";

export type Schema = Schema.Database;

export namespace Schema {

    export interface Item { }

    export interface Database extends Schema.Item {
        path: string;
        tables: Schema.Table[];
    }

    export interface Table extends Schema.Item {
        database: string;
        name: string;
        columns: Schema.Column[];
    }

    export interface Column extends Schema.Item {
        database: string;
        table: string;
        name: string;
        type: string;
        notnull: boolean;
        pk: number;
        defVal: string;
    }

    export function build(dbPath: string, sqlite3: string): Thenable<Schema.Database> {
        return new Promise(resolve => {
            let schema = {
                path: dbPath,
                tables: []
            } as Schema.Database;

            const tablesQuery = `SELECT name FROM sqlite_master WHERE type="table" ORDER BY name ASC;`;
            execute(sqlite3, dbPath, tablesQuery, (resultSet) => {
                if (!resultSet || resultSet.length === 0) return;
                
                schema.tables = resultSet[0].rows.map(row => {
                    return {database: dbPath, name: row[0], columns: [] } as Schema.Table;
                });

                let columnsQuery = schema.tables.map(table => `PRAGMA table_info(${table.name});`).join('\n');
                execute(sqlite3, dbPath, columnsQuery, (resultSet) => {
                    if (!resultSet || resultSet.length === 0) return;

                    resultSet.forEach(result => {
                        let tableName = result.stmt.replace(/.+\((\w+)\).+/, '$1');
                        for(let i=0; i<schema.tables.length; i++) {
                            if (schema.tables[i].name === tableName) {
                                schema.tables[i].columns = result.rows.map(row => {
                                    return {
                                        database: dbPath,
                                        table: tableName,
                                        name: row[result.header.indexOf('name')],
                                        type: row[result.header.indexOf('type')].toUpperCase(),
                                        notnull: row[result.header.indexOf('notnull')] === '1' ? true : false,
                                        pk: Number(row[result.header.indexOf('pk')]) || 0,
                                        defVal: row[result.header.indexOf('dflt_value')]
                                    } as Schema.Column;
                                });
                                break;
                            }
                        }
                    });

                    resolve(schema);
                });

            });
        });
    }
}