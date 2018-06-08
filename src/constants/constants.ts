
const pkg = require('../../package.json');

export class Constants {
    /* extension */
    public static extensionName = pkg.displayName;
    public static extensionVersion = pkg.version;

    /* output channel */
    public static outputChannelName: string = `${Constants.extensionName}`;

    /* webview panel */
    public static webviewPanelTitle = 'SQLite';
    //public static htmlAssetsPath = join(__dirname, '..', '..', 'www');
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
    public static runSqliteMasterQuery: string = 'sqlite.runSqliteMasterQuery';
    public static newQuery: string = 'sqlite.newQuery';
    public static runDocumentQuery: string = 'sqlite.runDocumentQuery';
    public static showQueryResult: string = 'sqlite.showQueryResult';
}