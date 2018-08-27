import { Disposable, commands, workspace, window, ViewColumn } from "vscode";
import { Webview } from "./webview";
import { join } from "path";
import { Constants } from "../constants/constants";
import * as csvStringify from 'csv-stringify/lib/sync';

export type ResultSet = Array<{stmt: string, header: string[], rows: string[][]}>;

class ResultView implements Disposable {
    private webview: Webview;
    private resultSet?: ResultSet;
    private resourcesPath: string;

    constructor(extensionPath: string) {
        this.resourcesPath = join(extensionPath, 'resources');
        this.webview = new Webview(this.resourcesPath, 'query-result', Constants.webviewPanelTitle);
        this.webview.on('export.json', (data: Object) => this.exportJson(data));
        this.webview.on('export.csv', (data: Object) => this.exportCsv(data));
    }

    display(resultSet: ResultSet, recordsPerPage: number): void {
        this.resultSet = resultSet;

        let tplPath = join(this.resourcesPath, 'views', 'query_result', 'html', 'index.html.tpl');
        try {
            this.webview.show(tplPath, {resultSet: resultSet.map((result, index) => {(<any>result)['id'] = index; return result; }), recordsPerPage: recordsPerPage});
        } catch(err) {
            console.log(err);
        }
    }

    private exportJson(data: Object) {
        let result_id = data.hasOwnProperty('result_id')? Number.parseInt((<any>data)['result_id']) : -1;
        let json: string = '{}';
        if (this.resultSet) {
            json = this.toJson(this.resultSet, result_id);
        }
        this.createFile('json', json);
    }

    private exportCsv(data: Object) {
        let result_id = data.hasOwnProperty('result_id')? Number.parseInt((<any>data)['result_id']) : -1;
        let csv: string = '';
        if (this.resultSet) {
            csv = this.toCsv(this.resultSet, result_id);
        }
        this.createFile('csv', csv);
    }
    
    private toJson(resultSet: ResultSet, index?: number): string {
        if (index !== undefined) {
            let result = resultSet[index];
            return JSON.stringify(result, null, 2);
        } else {
            return JSON.stringify(resultSet, null, 2);
        }
    }

    private toCsv(resultSet: ResultSet, index: number): string {
        let header: string[] = [];
        let rows: string[][] = [];
        let result = resultSet[index];
        if (result) {
            header = result.header;
            rows = result.rows;
        }
        let options = { columns: header, header: true };
        let csv = csvStringify(rows, options);
        return csv;
    }

    private createFile(language: string, content: string) {
        workspace.openTextDocument({language: language, content: content}).then(
            doc => {
                window.showTextDocument(doc, ViewColumn.One).then(() => {
                    commands.executeCommand('workbench.action.files.saveAs');
                });
            },
            err => console.log(err)
        );
    }

    dispose() {
        this.webview.dispose();
        this.webview.removeAllListeners();
    }
}

export default ResultView;