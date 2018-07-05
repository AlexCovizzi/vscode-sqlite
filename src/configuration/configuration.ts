import { workspace, Disposable } from "vscode";
import { logger } from "../logging/logger";
import { validateOrFallback } from "../utils/cmdSqliteUtils";

export class Configuration implements Disposable {
    private disposable: Disposable;

    sqlite3?: string;
    autopick!: boolean;
    logLevel!: string;
    showTableLimit!: number;

    constructor(private extensionPath: string) {
        this.load();

        let subscriptions = [];
        subscriptions.push(workspace.onDidChangeConfiguration(() => this.load()));

        this.disposable = Disposable.from(...subscriptions);
    }

    private load() {
        this.sqlite3 = this._sqlite3();
        this.autopick = this._autopick();
        this.logLevel = this._logLevel();
        this.showTableLimit = this._showTableLimit();
        logger.debug(`Configuration loaded.`);
    }

    dispose() {
        this.disposable.dispose();
    }

    private _sqlite3() {
        let sqlite3Conf = workspace.getConfiguration().get('sqlite.sqlite3');
        let sqlite3: string | undefined = sqlite3Conf? sqlite3Conf.toString() : '';
        return validateOrFallback(sqlite3, this.extensionPath);
    }

    private _autopick(): boolean {
        let autopick = workspace.getConfiguration().get('sqlite.autopick');
        if (!( typeof autopick === 'boolean')) {
            return false;
        } else {
            return autopick? true : false;
        }
    }

    private _logLevel(): string {
        let logLevelConf = workspace.getConfiguration().get('sqlite.logLevel');
        let logLevel = logLevelConf? logLevelConf.toString() : "INFO";
        return logLevel;
    }

    private _showTableLimit(): number {
        let showTableLimitConf = workspace.getConfiguration().get('sqlite.showTableLimit');
        let showTableLimit = Number.parseInt(showTableLimitConf? showTableLimitConf.toString() : '-1');
        return showTableLimit;
    }
}

