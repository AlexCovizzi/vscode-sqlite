import { WebviewPanel, window, ViewColumn, Disposable, Uri } from "vscode";
import { EventEmitter } from "events";
import { TemplateEngine } from "./tplEngine";

/**
 * Wrapper around vscode.WebviewPanel
 */
export class Webview extends EventEmitter {
    private disposable?: Disposable;

    private panel: WebviewPanel | undefined;
    private tplEngine: TemplateEngine;

    constructor(private resourcesPath: string, private type: string, private title: string) {
        super();
        this.tplEngine = new TemplateEngine();
    }

    /**
     * Show in a webview the template with this context
     * 
     * @param resultSet 
     */
    show(tplPath: string, context: Object) {
        if (!this.panel) {
            this.init();
        }
        if (this.panel) {
            let html = this.tplEngine.process(tplPath, context);
            this.panel.webview.html = html;
        }
    }

    send(command: string, text: string) {
        if (this.panel) {
            this.panel.webview.postMessage({command: command, text: text});
        }
    }

    private init() {
        let subscriptions = [];

        let options = {
            enableScripts: true,
            retainContextWhenHidden: false, // we dont need to keep the state
            localResourceRoots: [Uri.parse(this.resourcesPath).with({scheme: 'vscode-resource'})]
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
        this.panel = undefined;
        if (this.disposable) {
            this.disposable.dispose();
        }
    }
}