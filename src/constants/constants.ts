const pkg = require('../../package.json');

export namespace Constants {
    /* extension */
    export const extensionName = pkg.name;
    export const extensionDisplayName = pkg.displayName;
    export const extensionVersion = pkg.version;

    /* output channel */
    export const outputChannelName: string = `${extensionDisplayName}`;

    /* explorer */
    export const sqliteExplorerViewId = pkg.contributes.views.explorer[0].id;
}