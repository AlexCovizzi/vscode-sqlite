
const pkg = require('../../package.json');

export namespace Constants {
    /* extension */
    export const extensionName = pkg.name;
    export const extensionDisplayName = pkg.displayName;
    export const extensionVersion = pkg.version;

    /* output channel */
    export const outputChannelName: string = `${extensionDisplayName}`;

    /* webview panel */
    export const webviewPanelTitle = 'SQLite';
    //public static htmlAssetsPath = join(__dirname, '..', '..', 'www');

    export const sqliteExplorerViewId = "sqlite.sqliteExplorer";
}

export namespace Commands {
    export const exploreDatabase: string = 'sqlite.exploreDatabase';
    export const closeExplorerDatabase: string = 'sqlite.closeExplorerDatabase';
    export const ctxExploreDatabase: string = 'sqlite.ctxExploreDatabase';
    export const ctxCloseExplorerDatabase: string = 'sqlite.ctxCloseExplorerDatabase';
    export const useDatabase: string = 'sqlite.useDatabase';
    export const newQuery: string = 'sqlite.newQuery';
    export const quickQuery: string = 'sqlite.quickQuery';
    export const runDocumentQuery: string = 'sqlite.runDocumentQuery';
    export const refreshExplorer: string = 'sqlite.refreshExplorer';
    export const runTableQuery: string = 'sqlite.runTableQuery';
    export const runSqliteMasterQuery: string = 'sqlite.runSqliteMasterQuery';
    // private commands (this commands are used internally and not declared in package.json)
    export const runQuery: string = 'sqlite.runQuery';
    export const showQueryResult: string = 'sqlite.showQueryResult';
    export const showAndSaveNewFile: string = 'sqlite.showAndSaveNewFile';
}