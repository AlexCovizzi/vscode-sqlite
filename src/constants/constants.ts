
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
    public static exploreDatabase: string = 'sqlite.exploreDatabase';
    public static closeExplorerDatabase: string = 'sqlite.closeExplorerDatabase';
    public static bindDatabase: string = 'sqlite.bindDatabase';
    public static newQuery: string = 'sqlite.newQuery';
    public static runDocumentQuery: string = 'sqlite.runDocumentQuery';
    public static refreshExplorer: string = 'sqlite.refreshExplorer';
    public static runTableQuery: string = 'sqlite.runTableQuery';
    public static runSqliteMasterQuery: string = 'sqlite.runSqliteMasterQuery';
    // private commands
    public static runQuery: string = 'sqlite.runQuery';
    public static showQueryResult: string = 'sqlite.showQueryResult';
}