import { Message, MessageHandler, parseMessageCommand } from "./htmlview";
import { commands, workspace, window, ViewColumn } from "vscode";
import * as csvStringify from 'csv-stringify/lib/sync';

export type ResultSet = Array<{stmt: string, header: string[], rows: string[][]}>;

export class ResultViewMessageHandler implements MessageHandler {

    constructor(private recordsPerPage: number, private resultSet: ResultSet) {
    }

    handle(message: Message): Promise<any> {
        let command = parseMessageCommand(message.command);
        
        switch(command.type) {
            case 'fetch':
                return this.handleFetch(command.rest);
            case 'export':
                return this.handleExport(command.tokens[0], command.tokens[1]);
            default:
                return Promise.reject("Invalid request");
        }
    }

    handleExport(extension: string, index: string) {
        switch(extension) {
            case 'json':
                this.exportJson(index);
                break;
            case 'csv':
                this.exportCsv(index);
                break;
            default:
                return Promise.reject("Invalid export extension");
        }
        return Promise.resolve();
    }

    handleFetch(resource: string) {
        let firstTkn = resource.split('/')[0];
        switch(firstTkn) {
            case 'resultSet':
                return this._fetch({resultSet: this.resultSet}, resource);
            case 'pageRows':
                return Promise.resolve(this.recordsPerPage);
            default:
                return Promise.reject("Resource not available");
        }
    }

    exportJson(idx?: number|string) {
        if (idx !== undefined) {
            this._fetch({resultSet: this.resultSet}, `resultSet/${idx}`).then(result => {
                let json = result? this.toJson(result) : '{}';
                this.exportFile('json', json);
            });
        }
    }

    exportCsv(idx?: number|string) {
        if (idx !== undefined) {
            this._fetch({resultSet: this.resultSet}, `resultSet/${idx}`).then(result => {
                let csv = result? this.toCsv(result) : '';
                this.exportFile('csv', csv);
            });
        }
    }

    private toJson(obj: Object): string {
        return JSON.stringify(obj, null, 2);
    }

    private toCsv(obj: Object): string {
        let header = (<any>obj).header;
        let rows = (<any>obj).rows;
        let options = { columns: header, header: true };
        let csv = csvStringify(rows, options);
        return csv;
    }

    private exportFile(language: string, content: string) {
        workspace.openTextDocument({language: language, content: content}).then(
            doc => {
                window.showTextDocument(doc, ViewColumn.One).then(() => {
                    commands.executeCommand('workbench.action.files.saveAs');
                });
            },
            err => console.log(err)
        );
    }

    private _fetch(obj: Object, resource: string) {
        let ret: Object | undefined = obj;
        let tokens = resource.split('/');
        while(true) {
            let token = tokens.shift();
            if (token && ret) {
                ret = (<any>ret)[token];
            } else {
                break;
            }
        }
        return Promise.resolve(ret);
    }

    dispose() {
        
    }
}