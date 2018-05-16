import { WebviewPanel, Uri, window, ViewColumn, Disposable } from "vscode";
import { basename, join } from 'path';
import { platform } from "os";
import { Database, SQLScript } from "./sqlite";
import { getHtml } from "./html_source";

export class SQLitePanelController {
    private panel: WebviewPanel | undefined;
    private db: Database | undefined;

    /* keep track of the last query to the database
       this way we can refresh the results if necessary */
    private lastQuery: string | undefined;

    private disposable: Disposable;

    constructor(dbUri: Uri, extensionPath: string) {

        let subscriptions: Disposable[] = [];

        // Create WebView panel
        let panelTitle = basename(dbUri.fsPath);
        let assetsPath = join(extensionPath, 'assets');
        this.initPanel(panelTitle, assetsPath, subscriptions);

        // Initialize sqlite Database
        let sqlitePath = sqlite_path(extensionPath);
        this.initDatabase(sqlitePath, dbUri.fsPath, subscriptions);

        this.disposable = Disposable.from(...subscriptions);
    }

    initDatabase(sqlitePath: string, dbPath: string, subscriptions: Disposable[]) {
        let self = this;

        this.db = new Database(sqlitePath, dbPath, (err) => {
            window.showErrorMessage(err.message);
        });

        this.db.on('info', function (data: string) {
            self.sendMessageToPanel('query_result_html', `<pre>${data}</pre>`);
        });
        
        this.db.on('error', function (err: Error) {
            window.showErrorMessage(err.message);
        });

        subscriptions.push(this.db);
    }

    initPanel(panelTitle: string, assetsPath: string, subscriptions: Disposable[]) {
        this.panel = window.createWebviewPanel('sqlitedb', panelTitle, ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true,
                localResourceRoots: [ Uri.file(assetsPath) ] }
        );
        this.updatePanelHtml(getHtml(assetsPath));
        this.registerPanelEvents(subscriptions);

        this.panel.onDidDispose( () => {
            this.dispose();
        }, null, subscriptions);
    }

    updatePanelHtml(content: string) {
        if (this.panel) {
            this.panel.webview.html = content;
        }
    }

    sendMessageToPanel(command: string, text: string) {
        if (this.panel) {
            this.panel.webview.postMessage({ command: command, text: text });
        }
    }

    dispose() {
        this.disposable.dispose();
        this.panel = undefined;
    }

    private registerPanelEvents(subscriptions: Disposable[]) {
        if (!this.panel) { return; }

        this.panel.webview.onDidReceiveMessage(message => {
            console.log(`Webview received: [${message.command}] ${message.text}`);
            switch (message.command) {
                case 'query':
                    this._event_query(message.text);
                    return;
                case 'refresh':
                    this._event_refresh();
                    return;
                case 'tables':
                    this._event_tables();
                    return;
                case 'table_info':
                    this._event_table_info(message.text);
                    return;
                case 'table_query':
                    this._event_table_query(message.text);
                    return;
            }
        }, undefined, subscriptions);
    }

    private _event_query(s: string) {
        if (!this.db) { return; }

        this.lastQuery = s;

        let script = new SQLScript(s);

        let self = this;
        script.queries.forEach(query => {
            if (!self.db) { return; }

            self.db.exec(query, (result, err) => {
                if (err) {
                    window.showErrorMessage(err.message);
                } else {
                    this.sendMessageToPanel('query_result_html', result.toHtmlTable());
                    //this.sendMessageToPanel('query_result', JSON.stringify(result.rows));
                }
            });
        });
        
    }

    private _event_refresh() {
        if (this.lastQuery) {
            this._event_query(this.lastQuery);
        }
    }

    private _event_tables() {
        if (!this.db) { return; }

        let query = `SELECT name from sqlite_master WHERE type = "table"`;

        this.db.exec(query, (result, err) => {
            if (err) {
                window.showErrorMessage(err.message);
            } else {
                let tables = result.rows;
                let tablesjson = JSON.stringify(tables);
                this.sendMessageToPanel('tables', tablesjson);
            }
        });
    }

    private _event_table_info(tableName: string) {
        if (!this.db) { return; }

        let query = `PRAGMA table_info(${tableName})`;

        this.db.exec(query, (result, err) => {
            if (err) {
                window.showErrorMessage(err.message);
            } else {
                //this.sendMessageToPanel('result_html', result.toHtmlTable());
            }
        });
    }

    private _event_table_query(tableName: string) {
        if (!this.db) { return; }

        let query = `SELECT * from ${tableName} LIMIT 500`;

        this._event_query(query);
    }
}

function sqlite_path(extensionPath: string) {
    let os = platform();
    let sqliteBin: string;
    switch (os) {
        case 'win32':
            sqliteBin = 'sqlite-win32-x86.exe';
            break;
        case 'linux':
            sqliteBin = 'sqlite-linux-x86';
            break;
        case 'darwin':
            sqliteBin = 'sqlite-osx-x86';
            break;
        default:
            sqliteBin = '';
            break;
    }
    if (sqliteBin) {
        return join(extensionPath, 'bin', sqliteBin);
    } else {
        return '';
    }
}