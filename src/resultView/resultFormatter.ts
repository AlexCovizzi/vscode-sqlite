import { ResultSet } from "../database/resultSet";
import { HTMLTable } from "./htmlTable";

/**
 * Not implemented yet.
 * @param resultSet query result to format
 */
export function formatToJSON(resultSet: ResultSet): string {
    return 'Not implemented yet.';
}

/**
 * Format a query result to html.
 * A single result is formatted to an html table.
 * Every table is separated by a <div class='separator'></div>.
 * If a result is empty (has no rows) show no result found message.
 * 
 * @param resultSet query result to format
 */
export function formatToHTML(resultSet: ResultSet): string {
    let html = '';

    resultSet.forEach(result => {
        //html += `<div class="statement"><code>${result.stmt}</code></div>`;
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