import { workspace, Disposable, window } from "vscode";
import { logger } from "../logging/logger";
import { validateOrFallback } from "../utils/cmdSqliteUtils";

export class Setting<T> {
    private value!: T;
    constructor() {
    }
    get(): T { return this.value; }
    set(value: T) { this.value = value }
}

export class Configuration implements Disposable {
    private disposable: Disposable;

    sqlite3!: Setting<string|undefined>;
    autopick!: Setting<boolean>;
    logLevel!: Setting<string>;
    recordsPerPage!: Setting<number>;
    outputBuffer!: Setting<number>;

    constructor(private extensionPath: string) {
        this.sqlite3 = new Setting();
        this.autopick = new Setting();
        this.logLevel = new Setting();
        this.recordsPerPage = new Setting();
        this.outputBuffer = new Setting();
        this.load();

        let subscriptions = [];
        subscriptions.push(workspace.onDidChangeConfiguration(() => this.load()));

        this.disposable = Disposable.from(...subscriptions);
    }

    private load() {
        this.sqlite3.set(this._sqlite3());
        this.autopick.set(this._autopick());
        this.logLevel.set(this._logLevel());
        this.recordsPerPage.set(this._recordsPerPage());
        this.outputBuffer.set(this._outputBuffer());
        logger.debug(`Configuration loaded.`);
    }

    dispose() {
        this.disposable.dispose();
    }

    private _sqlite3() {
        let sqlite3Conf = workspace.getConfiguration().get('sqlite.sqlite3');
        let sqlite3: string | undefined = sqlite3Conf? sqlite3Conf.toString() : '';
        sqlite3 = validateOrFallback(sqlite3, this.extensionPath);
        if (sqlite3 === undefined) { 
            window.showErrorMessage("Unable to execute sqlite3 queries, change the sqlite3.sqlite3 setting to fix this issue.")
        }
        return sqlite3;
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

    private _recordsPerPage(): number {
        let recordsPerPageConf = workspace.getConfiguration().get('sqlite.recordsPerPage');
        let recordsPerPage = Number.parseInt(recordsPerPageConf? recordsPerPageConf.toString() : '50');
        return recordsPerPage;
    }

    private _outputBuffer(): number {
        const def = 1024*1024;
        let outputBufferConf = workspace.getConfiguration().get('sqlite.outputBuffer');
        let outputBuffer = Number.parseInt(outputBufferConf? outputBufferConf.toString() : def.toString());
        return outputBuffer;
    }
}

