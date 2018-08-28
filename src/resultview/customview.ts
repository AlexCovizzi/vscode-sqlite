import { WebviewPanel, window, ViewColumn, Disposable, Uri } from "vscode";
import { dirname } from "path";
import { readFile } from "fs";
import { randomString } from "../utils/utils";
import { EventEmitter } from "events";

export interface Message {
    command: string;
    data: Object;
    id?: string;
}

export class CustomView extends EventEmitter implements Disposable {
    private resourceScheme = 'vscode-resource';

    private disposable?: Disposable;

    private resourcesPath: string;
    private panel: WebviewPanel | undefined;
    private htmlCache: {[path: string]: string};

    constructor(private type: string, private title: string) {
        super();
        this.resourcesPath = "";
        this.htmlCache = {};
    }

    show(htmlPath: string) {
        this.resourcesPath = dirname(htmlPath);

        if (!this.panel) {
            this.init();
        }

        this.readWithCache(htmlPath, (html: string) => {
            if (this.panel) {
                // little hack to make the html unique so that the webview is reloaded
                html = html.replace(/\<\/body\>/, `<div id="${randomString(8)}"></div></body>`);
                this.panel.webview.html = html;
            }
        });
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
            retainContextWhenHidden: false, // we dont need to keep the state
            localResourceRoots: [Uri.parse(this.resourcesPath).with({scheme: 'vscode-resource'})]
        };

        this.panel = window.createWebviewPanel(this.type, this.title, ViewColumn.Two,
            options
        );
        subscriptions.push(this.panel);

        subscriptions.push(this.panel.onDidDispose(() => this.dispose()));

        subscriptions.push(this.panel.webview.onDidReceiveMessage((message: Message) => {
            //console.log("Received message from webview: "+JSON.stringify(message));
            this.handleMessage(message);
        }));

        this.disposable = Disposable.from(...subscriptions);
    }

    private readWithCache(path: string, callback: (html: string) => void) {
        let html: string = '';
        if (path in this.htmlCache) {
            html = this.htmlCache[path];
            callback(html);
        } else {
            readFile(path, 'utf8', (err, content) => {
                html = content || "";
                html = this.replaceUris(html, path);
                this.htmlCache[path] = html;
                callback(html);
            });
        }
    }

    private replaceUris(html: string, htmlPath: string) {
        let basePath = Uri.parse(dirname(htmlPath)).with({scheme: this.resourceScheme}).toString();
        let regex = /(href|src)\=\"(.+?)\"/g;
        html = html.replace(regex, `$1="${basePath+'$2'}"`);
        return html;
    }
}