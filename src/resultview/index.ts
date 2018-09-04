import { Disposable, workspace, window, ViewColumn, commands } from "vscode";
import { CustomView, Message } from "./customview";
import { queryObject, sanitizeStringForHtml } from "../utils/utils";
import * as csvStringify from 'csv-stringify/lib/sync';
import { join } from "path";
import { EOL } from "os";
import { ResultSet } from "../interfaces";

export default class ResultView extends CustomView implements Disposable {

    private resultSet?: ResultSet;
    private recordsPerPage: number;
    private msgQueue: Message[];

    constructor(private extensionPath: string) {
        super('resultview', 'SQLite');

        this.msgQueue = [];
        this.recordsPerPage = 50;
    }

    display(resultSet: ResultSet | Promise<ResultSet | undefined>, recordsPerPage: number) {
        this.show(join(this.extensionPath, 'out', 'resultview', 'htmlcontent', 'index.html'));
        
        this.recordsPerPage = recordsPerPage;
        this.resultSet = undefined;
        this.msgQueue = [];
        
        if (Array.isArray(resultSet)) {
            this.resultSet = resultSet;
        } else {
            resultSet.then(rs => {
                this.resultSet = rs;
                if (this.resultSet) {
                    if (this.msgQueue) this.msgQueue.forEach(this.handleMessage.bind(this));
                } else {
                    this.dispose();
                }
            });
        }
    }

    handleMessage(message: Message) {
        let cmdType = message.command.split(':')[0];
        let cmdRest = message.command.split(':')[1];
        if (this.resultSet) {
            let obj: Object | undefined;
            switch(cmdType) {
                case 'fetch':
                    obj = this.fetch(cmdRest);
                    if (obj != null) this.send({command: message.command, data: obj, id: message.id} as Message);
                    break;
                case 'csv':
                    obj = this.fetch(cmdRest);
                    if (obj != null) this.exportCsv(obj as any);
                    break;
                case 'json':
                    obj = this.fetch(cmdRest);
                    if (obj != null) this.exportJson(obj as any);
                    break;
                case 'html':
                    obj = this.fetch(cmdRest);
                    if (obj != null) this.exportHtml(obj as any);
                    break;
                default:
                    break;
            }
        } else {
            this.msgQueue.push(message);
        }
    }

    private fetch(resource: string) {
        return queryObject({resultSet: this.resultSet, pageRows: this.recordsPerPage}, resource);
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