
import { ResultSet } from "../database/resultSet";
import { formatToHTML, formatToJSON, formatToCSV } from "./resultFormatter";
import { getHtml } from "./htmlcontent";
import { Disposable, commands } from "vscode";
import { Webview } from "./webview";
import { Constants, Commands } from "../constants/constants";


export class ResultView implements Disposable {
    private webview: Webview;
    private resultSet?: ResultSet;

    constructor() {
        this.webview = new Webview('query-result', Constants.webviewPanelTitle);
        this.webview.on('export.json', (data: Object) => this.exportJson(data));
        this.webview.on('export.csv', (data: Object) => this.exportCsv(data));
    }

    show(resultSet: ResultSet): void {
        this.resultSet = resultSet;

        let htmlFormattedResult = formatToHTML(resultSet);
        let html = getHtml(htmlFormattedResult);
        this.webview.show(html);
    }

    private exportJson(data: Object) {
        let result_id = data.hasOwnProperty('result_id')? Number.parseInt((<any>data)['result_id']) : -1;
        let json: string = '{}';
        if (this.resultSet) {
            json = formatToJSON(this.resultSet, result_id);
        }
        commands.executeCommand(Commands.showAndSaveNewFile, 'json', json);
    }

    private exportCsv(data: Object) {
        let result_id = data.hasOwnProperty('result_id')? Number.parseInt((<any>data)['result_id']) : -1;
        let csv: string = '';
        if (this.resultSet) {
            csv = formatToCSV(this.resultSet, result_id);
        }
        commands.executeCommand(Commands.showAndSaveNewFile, 'csv', csv);
    }

    dispose() {
        this.webview.dispose();
        console.log(this.webview);
    }
}


