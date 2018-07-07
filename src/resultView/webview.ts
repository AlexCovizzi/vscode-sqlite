import { WebviewPanel, window, ViewColumn, Disposable, Uri } from "vscode";
import { EventEmitter } from "events";

/**
 * Wrapper around vscode.WebviewPanel
 */
export class Webview extends EventEmitter {
    private disposable?: Disposable;
    private panel: WebviewPanel | undefined;

    constructor(private resourcesPath: Uri, private type: string, private title: string) {
        super();
    }

    /**
     * Show the query result in a webview.
     * 
     * @param resultSet 
     */
    show(html: string) {
        if (!this.panel) {
            this.init();
        }
        if (this.panel) {
            this.panel.webview.html = html;
        }
    }

    private init() {
        let subscriptions = [];

        let options = {
            enableScripts: true,
            retainContextWhenHidden: false, // we dont need to keep the state
            localResourceRoots: [this.resourcesPath]
        };

        this.panel = window.createWebviewPanel(this.type, this.title, ViewColumn.Two,
            options
        );

        subscriptions.push(this.panel.onDidDispose(() => this.dispose()));

        subscriptions.push(this.panel.webview.onDidReceiveMessage(e => {
            this.emit(e.command as string, JSON.parse(e.text));
        }));

        this.disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this.removeAllListeners();
        this.panel = undefined;
        if (this.disposable) {
            this.disposable.dispose();
        }
    }
}