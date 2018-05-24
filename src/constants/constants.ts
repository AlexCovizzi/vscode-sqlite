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