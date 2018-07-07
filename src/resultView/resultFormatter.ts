import * as csvStringify from 'csv-stringify/lib/sync';
import { ResultSet } from "../database/resultSet";
import { HTMLTable } from "./htmlTable";
import { Uri } from 'vscode';
import { join } from 'path';

/**
 * Format a query result to html.
 * A single result is formatted to an html table.
 * Every table is separated by a <div class='separator'></div>.
 * If a result is empty (has no rows) a table with a single field 'no result found' is returned.
 * 
 * @param resultSet query result to format
 */
export function formatToHTML(resultSet: ResultSet, resourcesPath: Uri): string {
    let html = '';
    let csvIcon = join(resourcesPath.toString(), 'csv.svg');
    let jsonIcon = join(resourcesPath.toString(), 'json.svg');

    resultSet.forEach(result => {
        html += `<div>`;
        html += `<code>${result.stmt}</code>`;
        html += ` &nbsp;&nbsp; `;
        html += `<div style="display: inline-block;">`;
        html += `<button class="btn export-json" value="${result.id}" ><img src="${jsonIcon}" alt="Export json"></button>`;
        html += `<button class="btn export-csv" value="${result.id}" ><img src="${csvIcon}" alt="Export csv"></button>`;
        html += `</div>`;
        html += `</div>`;
        if (result.rows.length > 0) {
            let htmlTable = new HTMLTable(true);
            htmlTable.setHeader(result.header);
            result.rows.forEach(row => {
                htmlTable.addRow(row);
            });
            html += htmlTable.toString();
        } else {
            html += `<table class="no-result"><td>No result found</td></table>`;
        }
        html += `<div class="separator"></div>`;
    });
    return html;
}

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