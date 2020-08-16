import { Disposable, workspace, window, ViewColumn, commands } from "vscode";
import { CustomView, Message } from "./customview";
import { sanitizeStringForHtml } from "../utils/utils";
import * as csvStringify from 'csv-stringify/lib/sync';
import { EOL } from "os";
import { ResultSet } from "../common";

export default class ResultView extends CustomView implements Disposable {

    private resultSet?: ResultSet;
    private msgQueue: Message[];

    constructor(private extensionPath: string) {
        super('resultview', 'SQLite');

        this.msgQueue = [];
    }

    display(resultSet: Promise<ResultSet|undefined>, recordsPerPage: number) {
        this.show(this.extensionPath, recordsPerPage);
        
        this.msgQueue = [];
        
        resultSet.then(rs => {
            this.resultSet = rs? rs : [];
            const results = this.resultSet? this.resultSet : [];
            this.send({type: "FETCH_RESULTS", payload: results.map((result, idx) => (
                {statement: result.stmt, columns: result.header, size: result.rows.length, rows: {rows: result.rows.slice(0, recordsPerPage), offset: 0, limit: recordsPerPage, result: idx}}
            ))});
            if (this.msgQueue) this.msgQueue.forEach(this.handleMessage.bind(this));
        });
    }

    handleMessage(message: Message) {
        if (!this.resultSet) {
            this.msgQueue.push(message);
            return;
        }
        switch(message.type) {
            case "FETCH_RESULTS": {
                const results = this.resultSet? this.resultSet : [];
                this.send({type: "FETCH_RESULTS", payload: results.map(result => (
                    {statement: result.stmt, columns: result.header, size: result.rows.length}
                ))});
            }
            case "FETCH_ROWS": {
                const result = this.resultSet? this.resultSet[message.payload.result] : null;
                const fromRow = message.payload.offset;
                const toRow = fromRow + message.payload.limit;
                this.send({type: "FETCH_ROWS", payload: {result: message.payload.result, rows: result!.rows.slice(fromRow, toRow), offset: fromRow, limit: message.payload.limit}});
            }
            case "EXPORT_RESULTS": {
                const obj = message.payload.result ? this.resultSet![message.payload.result] : this.resultSet;
                const format = message.payload.format;
                if (format === "csv") this.exportCsv(obj);
                if (format === "html") this.exportHtml(obj);
                if (format === "json") this.exportJson(obj);
            }
        }
    }

    private exportJson(obj: Object) {
        let content = JSON.stringify(obj);
        this.exportFile('json', content);
    }

    private exportCsv(obj: {header: string[], rows: string[][]} | Array<{header: string[], rows: string[][]}>) {
        // setTimeout is just to make this async
        setTimeout(() => {
            let csvList = [];
            if (Array.isArray(obj)) {
                for(let i in obj) {
                    let ret = csvStringify(obj[i].rows, { columns: obj[i].header, header: true });
                    csvList.push(ret);
                }
            } else {
                let ret = csvStringify(obj.rows, { columns: obj.header, header: true });
                csvList.push(ret);
            }
            
            this.exportFile('csv', csvList.join(EOL));
        }, 0);
    }

    private exportHtml(obj: {header: string[], rows: string[][]} | Array<{header: string[], rows: string[][]}>) {
        let toHtml = (header: string[], rows: string[][]) => {
            let str = "<table>";
            str += "<tr>" + header.map(val => `<th>${sanitizeStringForHtml(val)}</th>`).join("") + "<tr>";
            str += rows.map(row => `<tr>${row.map(val => `<td>${sanitizeStringForHtml(val)}</td>`).join("")}</tr>`).join("");
            str += "</table>";
            return str;
        };
        
        setTimeout(() => {
            let htmlList = [];
            if (Array.isArray(obj)) {
                for(let i in obj) {
                    let ret = toHtml(obj[i].header, obj[i].rows);
                    htmlList.push(ret);
                }
            } else {
                let ret = toHtml(obj.header, obj.rows);
                htmlList.push(ret);
            }
            
            this.exportFile('html', htmlList.join(""));
        }, 0);
    }

    private exportFile(language: string, content: string) {
        workspace.openTextDocument({language: language, content: content})
            .then(doc => window.showTextDocument(doc, ViewColumn.One))
            .then(() => commands.executeCommand('workbench.action.files.saveAs'));
    }
}