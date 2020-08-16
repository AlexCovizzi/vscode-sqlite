import { WebviewPanel, window, ViewColumn, Disposable, Uri } from "vscode";
import { EventEmitter } from "events";
import { join } from "path";

export interface Message {
    type: string;
    payload: any;
}

export class CustomView extends EventEmitter implements Disposable {
    private resourceScheme = 'vscode-resource';

    private disposable?: Disposable;

    private resourcesPath: string;
    private panel: WebviewPanel | undefined;

    constructor(private type: string, private title: string) {
        super();
        this.resourcesPath = "";
    }

    show(basePath: string, recordsPerPage: number) {
        this.resourcesPath = join(basePath, "dist");

        if (!this.panel) {
            this.init();
        }
        
        const jsPath = join(this.resourcesPath, "resultview.js");
        this.panel!.webview.html = `
            <html>
                <head>
                    <title>ResultView</title>
                </head>
                <body>
                    <div id="root"></div>
                    <script>const RECORDS_PER_PAGE=${recordsPerPage || 25}</script>
                    <script src="${(this.panel!.webview as any).asWebviewUri(Uri.file(jsPath)).toString()}"></script>
                </body>
            </html>
        `;
    }

    send(message: Message) {
        if (this.panel) this.panel.webview.postMessage(message);
    }

    handleMessage(message: Message) {
        throw new Error("Method not implemented");
    }

    dispose() {
        if (this.disposable) {
            this.disposable.dispose();
        }
        this.panel = undefined;
    }

    private init() {
        let subscriptions = [];

        let options = {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [Uri.file(this.resourcesPath).with({scheme: this.resourceScheme})]
        };

        this.panel = window.createWebviewPanel(this.type, this.title, ViewColumn.Two,
            options
        );
        subscriptions.push(this.panel);

        subscriptions.push(this.panel.onDidDispose(() => this.dispose()));

        subscriptions.push(this.panel.webview.onDidReceiveMessage((message: Message) => {
            this.handleMessage(message);
        }));

        this.disposable = Disposable.from(...subscriptions);
    }
}
