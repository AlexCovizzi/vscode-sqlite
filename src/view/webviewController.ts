import { WebviewPanel, window, ViewColumn } from "vscode";
import { Constants } from '../constants/constants';
import { ResultSet } from "../database/resultSet";
import { QueryResultFormatter } from "./resultFormatter";
import { getHtml } from "./htmlcontent";

export class WebviewPanelController {
    private panel: WebviewPanel | undefined;
    private queryResultFormatter: QueryResultFormatter;

    constructor() {
        this.queryResultFormatter = new QueryResultFormatter();
    }

    showQueryResult(resultSet: ResultSet) {
        if (!this.panel) {
            this.init();
        }
        if (this.panel) {
            let htmlFormattedResult = this.queryResultFormatter.formatToHTML(resultSet);
            this.panel.webview.html = getHtml(htmlFormattedResult);
        }
    }

    private init() {
        let options = { enableScripts: false, retainContextWhenHidden: false, localResourceRoots: [] };
        this.panel = window.createWebviewPanel('query-result', Constants.webviewPanelTitle, ViewColumn.Two,
            options
        );

        this.panel.onDidDispose( () => {
            this.dispose();
        }, null);
    }

    dispose() {
        this.panel = undefined;
    }
}