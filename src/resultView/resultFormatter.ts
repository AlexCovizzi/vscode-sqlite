import * as csvStringify from 'csv-stringify/lib/sync';
import { ResultSet } from "../database/resultSet";

/**
 * @param resultSet query result to format
 */
export function formatToJSON(resultSet: ResultSet, result_id?: number): string {
    if (result_id !== undefined) {
        let result = resultSet.find(res => res.id === result_id) || {};
        return JSON.stringify(result, null, 2);
    } else {
        return resultSet.toJSON();
    }
}

/**
 * @param resultSet query result to format
 */
export function formatToCSV(resultSet: ResultSet, result_id: number): string {
    let header: string[] = [];
    let rows: string[][] = [];
    let result = resultSet.find(res => res.id === result_id);
    if (result) {
        header = result.header;
        rows = result.rows;
    }
    let options = { columns: header, header: true };
    let csv = csvStringify(rows, options);
    return csv;
}