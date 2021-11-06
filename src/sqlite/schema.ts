import { CliDatabase } from "./cliDatabase";
import { isFileSync } from "../utils/files";
import { logger } from "../logging/logger";
import { sqlSafeName } from "../utils/utils";

export type Schema = Schema.Database;

export namespace Schema {

    export type Item = Database | Table | Column;

    export interface Database {
        path: string;
        tables: Schema.Table[];
    }

    export interface Table {
        database: string;
        name: string;
        type: string;
        columns: Schema.Column[];
    }

    export interface Column {
        database: string;
        table: string;
        name: string;
        type: string;
        notnull: boolean;
        pk: number;
        defVal: string;
        generatedAlways: boolean;
        virtual: boolean;
        stored: boolean;
    }

    export function build(dbPath: string, sqlite3: string, options: { sql: string[] } = { sql: [] }): Promise<Schema.Database> {
        return new Promise((resolve, reject) => {
            if (!isFileSync(dbPath)) return reject(new Error(`Failed to retrieve database schema: '${dbPath}' is not a file`));

            let schema = {
                path: dbPath,
                tables: []
            } as Schema.Database;

            const tablesQuery = `SELECT name, type FROM sqlite_master
                                WHERE (type="table" OR type="view")
                                AND name <> 'sqlite_sequence'
                                AND name <> 'sqlite_stat1'
                                ORDER BY type ASC, name ASC;`;

            let database = new CliDatabase(sqlite3, dbPath, (err) => {
                reject(err);
            });

            
            // execute sql before the queries, reject if there is any error
            for(let sql of options.sql) {
                database.execute(sql, (_rows, err) => {
                    if (err) reject(new Error(`Failed to setup database: ${err.message}`));
                });
            }

            database.execute(tablesQuery, (rows, err) => {
                if (err) return reject(err);

                rows.shift(); // remove header from rows
                schema.tables = rows.map(row => {
                    return {database: dbPath, name: row[0], type: row[1], columns: [] } as Schema.Table;
                });

                async function tryTableInfoPragma(tableInfoPragma: string) {
                    let ok = false;
                    const promises = schema.tables.map(async (table) => {
                        const columnQuery = `PRAGMA ${tableInfoPragma}(${sqlSafeName(table.name)});`;
                        const rows = await database.executePromise(columnQuery);
                        if (rows.length < 2) {
                            return;
                        }
                        ok = true;
                        //let tableName = result.stmt.replace(/.+\(\'?(\w+)\'?\).+/, '$1');
                        let header: string[] = rows.shift() || [];
                        table.columns = rows
                            .filter(row => {
                                return row[header.indexOf('hidden')] !== '1';
                            })
                            .map(row => {
                                const type = row[header.indexOf('type')]
                                    .toUpperCase()
                                    .replace(/ ?GENERATED ALWAYS$/, '');
                                const virtual = row[header.indexOf('hidden')] === '2';
                                const stored = row[header.indexOf('hidden')] === '3'
                                const generatedAlways
                                    = virtual
                                    || stored
                                    || / ?GENERATED ALWAYS$/.test(row[header.indexOf('type')].toUpperCase());
                                return {
                                    database: dbPath,
                                    table: table.name,
                                    name: row[header.indexOf('name')],
                                    type,
                                    notnull: row[header.indexOf('notnull')] === '1' ? true : false,
                                    pk: Number(row[header.indexOf('pk')]) || 0,
                                    defVal: row[header.indexOf('dflt_value')],
                                    generatedAlways,
                                    virtual,
                                    stored,
                                } as Schema.Column;
                            });
                    });
                    await Promise.all(promises);
                    return ok;
                }
                // The table_xinfo pragma first appeared in SQLite 3.26.0.
                // Use table_info as fallback.
                tryTableInfoPragma('table_xinfo')
                    .then((ok) => {
                        if (!ok) return tryTableInfoPragma('table_info');
                    })
                    .catch((err) => {
                        logger.warn(err ? err.message || err : 'unknown error');
                    })
                    .then(() => {
                        database.close(() => {
                            resolve(schema);
                        });
                    })
            });
        });
    }
}