const pkg = require('../package.json');

export class Constants {
    public static outputChannelName: string = `SQLite`;
    public static version = `v${pkg.version}`;
}