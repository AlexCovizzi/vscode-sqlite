import { WebviewPanel, Uri, window, ViewColumn } from "vscode";
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
            this.panel.webview.html = getHtml(this.queryResultFormatter.formatToHTML(resultSet));
        }
    }

    private init() {
        this.panel = window.createWebviewPanel('query-result', Constants.webviewPanelTitle, ViewColumn.Two,
            { enableScripts: true, retainContextWhenHidden: false,
                localResourceRoots: [ Uri.file(Constants.htmlAssetsPath) ] }
        );

        this.panel.onDidDispose( () => {
            this.dispose();
        }, null);
    }

    dispose() {
        this.panel = undefined;
    }
}