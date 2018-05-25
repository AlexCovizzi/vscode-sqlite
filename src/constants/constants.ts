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
}

export class Commands {
    public static openDatabase: string = 'extension.openDatabase';
    public static closeDatabase: string = 'extension.closeDatabase';
    public static addToExplorer: string = 'extension.addToExplorer';
    public static removeFromExplorer: string = 'extension.removeFromExplorer';
    public static refreshExplorer: string = 'extension.refreshExplorer';
    public static runSql: string = 'extension.runSql';
    public static runTableQuery: string = 'extension.runTableQuery';
}