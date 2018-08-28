import { WebviewPanel, window, ViewColumn, Disposable, Uri } from "vscode";
import { join, dirname } from "path";
import { readFile } from "fs";
import { randomString } from "../utils/utils";

export function parseMessageCommand(command: string): {type: string, tokens: string[], rest: string} {
    let parts = command.split(':');
    let type = parts[0];
    let tokens = parts[1].split('/').filter(tkn => tkn !== "");
    let rest = tokens.join('/');
    return {type: type, tokens: tokens, rest: rest};
}

export interface MessageHandler extends Disposable {
    handle: (message: Message) => Promise<any>;
}

export interface Message {
    command: string;
    data: Object;
    id?: string;
}

interface Cache {
    [path: string]: string;
}

export class HtmlView implements Disposable {
    private resourceScheme = 'vscode-resource';

    private disposable?: Disposable;

    private resourcesPath: string;
    private panel: WebviewPanel | undefined;
    private htmlCache: Cache;
    private handler?: MessageHandler;
    private queue: Message[];

    constructor(extensionPath: string, private type: string, private title: string) {
        this.resourcesPath = join(extensionPath, 'out', 'resultview', 'htmlcontent');
        this.htmlCache = {};
        this.queue = [];
    }

    show(htmlPath: string, handler?: MessageHandler) {
        if (this.handler) {
            this.handler.dispose();
        }
        this.handler = handler;

        if (!this.panel) {
            this.init();
        }

        this.queue = [];

        this.readWithCache(htmlPath, (html: string) => {
            if (this.panel) {
                // little hack to make the html unique so that the webview is reloaded
                html = html.replace(/\<body\>/, `<body id="${randomString(8)}">`);
                this.panel.webview.html = html;
            }
        });
    }

    dispose() {
        if (this.handler) {
            this.handler.dispose();
        }
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

            if (this.handler) {
                this.handler.handle(message).then((response?: any) => {
                    if (this.panel && response) {
                        //console.log("Responded to webview: "+JSON.stringify({command: message.command, data: response}));
                        this.panel.webview.postMessage({command: message.command, data: response, id: message.id});
                    }
                });
            } else {
                this.queue.push(message);
            }
        }));

        this.disposable = Disposable.from(...subscriptions);
    }

    setHandler(handler: MessageHandler) {
        this.handler = handler;
        for(let i in this.queue) {
            let message = this.queue[i];
            this.handler.handle(this.queue[i]).then((response?: any) => {
                if (this.panel && response) {
                    //console.log("Responded to webview: "+JSON.stringify({command: message.command, data: response}));
                    this.panel.webview.postMessage({command: message.command, data: response, id: message.id});
                }
            });
        }
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