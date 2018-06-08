import { WebviewPanel, window, ViewColumn, Disposable } from "vscode";
import { Constants } from '../constants/constants';
import { ResultSet } from "../database/resultSet";
import { formatToHTML } from "./resultFormatter";
import { getHtml } from "./htmlcontent";


/**
 * Interface to show the query result.
 */
export interface ResultView extends Disposable {
    show(resultSet: ResultSet): void;
}


export class WebviewPanelController implements ResultView {
    private panel: WebviewPanel | undefined;

    constructor() {
    }

    /**
     * Show the query result in a webview.
     * 
     * @param resultSet 
     */
    show(resultSet: ResultSet) {
        if (!this.panel) {
            this.init();
        }
        if (this.panel) {
            let htmlFormattedResult = formatToHTML(resultSet);
            this.panel.webview.html = getHtml(htmlFormattedResult);
        }
    }

    private init() {
        let options = {
            enableScripts: false, // we dont need js scripts for now
            retainContextWhenHidden: false, // we dont need to keep the state
            localResourceRoots: [] // we dont need any resource for now
        };
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