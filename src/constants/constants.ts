import { join } from "path";

const pkg = require('../../package.json');

export class Constants {
    /* extension */
    public static extensionName = pkg.displayName;
    public static extensionVersion = `v${pkg.version}`;

    /* output channel */
    public static outputChannelName: string = `${Constants.extensionName}`;
    public static outputChannelShowTime: boolean = false;
    public static outputChannelShowVersion: boolean = false;
    public static outputChannelShowLevel: boolean = true;

    /* query result */
    // query result path: {queryResultScheme}:{queryResultPrefix}-{queryResultId}.{queryResultExtension}
    public static queryResultIdLength = 8;
    public static queryResultScheme = 'query-result';
    public static queryResultExtension = 'qres';
    public static queryResultPrefix = 'sqlite';

    /* webview panel */
    public static webviewPanelTitle = 'SQLite';
    public static htmlAssetsPath = join(__dirname, '..', '..', 'www');
}

export class Commands {
    public static openDatabase: string = 'extension.openDatabase';
    public static closeDatabase: string = 'extension.closeDatabase';
    public static showOpenDatabaseQuickPick: string = 'extension.showOpenDatabaseQuickPick';
    public static showCloseDatabaseQuickPick: string = 'extension.showCloseDatabaseQuickPick';
    public static showBindDatabaseQuickPick: string = 'extension.showBindDatabaseQuickPick';
    public static addToExplorer: string = 'extension.addToExplorer';
    public static removeFromExplorer: string = 'extension.removeFromExplorer';
    public static refreshExplorer: string = 'extension.refreshExplorer';
    public static runQuery: string = 'extension.runQuery';
    public static runTableQuery: string = 'extension.runTableQuery';
    public static newQuery: string = 'extension.newQuery';
    public static runDocumentQuery: string = 'extension.runDocumentQuery';
    public static showQueryResult: string = 'extension.showQueryResult';
}