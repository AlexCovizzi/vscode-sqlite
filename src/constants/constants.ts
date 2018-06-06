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
    public static openDatabase: string = 'sqlite.openDatabase';
    public static closeDatabase: string = 'sqlite.closeDatabase';
    public static bindDatabase: string = 'sqlite.bindDatabase';
    public static addToExplorer: string = 'sqlite.addToExplorer';
    public static removeFromExplorer: string = 'sqlite.removeFromExplorer';
    public static refreshExplorer: string = 'sqlite.refreshExplorer';
    public static runQuery: string = 'sqlite.runQuery';
    public static runTableQuery: string = 'sqlite.runTableQuery';
    public static newQuery: string = 'sqlite.newQuery';
    public static runDocumentQuery: string = 'sqlite.runDocumentQuery';
    public static showQueryResult: string = 'sqlite.showQueryResult';
}