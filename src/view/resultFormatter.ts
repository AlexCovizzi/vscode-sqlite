import { ResultSet } from "../database/resultSet";
import { HTMLTable } from "./htmlTable";

export class QueryResultFormatter {
    constructor() {

    }

    formatToJSON(resultSet: ResultSet): string {
        return resultSet.map(result => JSON.stringify(result, null, 2)).join('\n');
    }

    formatToHTML(resultSet: ResultSet): string {
        let html = '';
        resultSet.forEach(result => {
            let htmlTable = new HTMLTable(true);
            htmlTable.setHeader(result.header);
            result.rows.forEach(row => {
                htmlTable.addRow(row);
            });
            html += htmlTable.toString();
        });
        return html;
    }
}