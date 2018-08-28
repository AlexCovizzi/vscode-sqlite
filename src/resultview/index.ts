import { Disposable, workspace, window, ViewColumn, commands } from "vscode";
import { CustomView, Message } from "./customview";
import { queryObject } from "../utils/utils";
import * as csvStringify from 'csv-stringify';
import { join } from "path";

export type ResultSet = Array<{stmt: string, header: string[], rows: string[][]}>;

class ResultView extends CustomView implements Disposable {

    private resultSet?: ResultSet;
    private recordsPerPage: number;
    private msgQueue: Message[];

    constructor(private extensionPath: string) {
        super('resultview', 'SQLite');

        this.msgQueue = [];
        this.recordsPerPage = 50;
    }

    display(resultSet: ResultSet | Promise<ResultSet|undefined>, recordsPerPage: number) {
        this.show(join(this.extensionPath, 'out', 'resultview', 'htmlcontent', 'index.html'));
        
        this.recordsPerPage = recordsPerPage;
        this.resultSet = undefined;
        this.msgQueue = [];
        
        if (Array.isArray(resultSet)) {
            this.resultSet = resultSet;
        } else {
            resultSet.then(rs => {
                this.resultSet = rs;
                if (this.msgQueue) {
                    this.msgQueue.forEach(msg => {
                        this.handleMessage(msg);
                    });
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
                    if (obj) this.send({command: message.command, data: obj, id: message.id} as Message);
                    break;
                case 'csv':
                    obj = this.fetch(cmdRest);
                    if (obj) this.exportCsv(obj);
                    break;
                case 'json':
                    obj = this.fetch(cmdRest);
                    if (obj) this.exportJson(obj);
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

    private exportCsv(obj: Object) {
        let header = (<any>obj).header;
        let rows = (<any>obj).rows;
        let options = { columns: header, header: true };
        csvStringify(rows, options, (err, output) => {
            this.exportFile('csv', output.toString());
        });
    }

    private exportFile(language: string, content: string) {
        workspace.openTextDocument({language: language, content: content})
            .then(doc => window.showTextDocument(doc, ViewColumn.One))
            .then(() => commands.executeCommand('workbench.action.files.saveAs'));
    }
}

export default ResultView;