import { workspace, Disposable } from "vscode";
import { logger } from "../logging/logger";
import { validateOrFallback } from "../utils/cmdSqliteUtils";

export class Configuration implements Disposable {
    private disposable: Disposable;

    sqlite3?: string;
    autopick!: boolean;
    debug!: boolean;

    constructor(private extensionPath: string) {
        this.load();

        let subscriptions = [];
        subscriptions.push(workspace.onDidChangeConfiguration(() => this.load()));

        this.disposable = Disposable.from(...subscriptions);
    }

    private load() {
        this.sqlite3 = this._sqlite3();
        this.autopick = this._autopick();
        this.debug = this._debug();
        logger.output(`Loaded configuration.`);
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

    private _debug(): boolean {
        let debug = workspace.getConfiguration().get('sqlite.debug');
        if (!( typeof debug === 'boolean')) {
            return false;
        } else {
            return debug? true : false;
        }
    }
}

