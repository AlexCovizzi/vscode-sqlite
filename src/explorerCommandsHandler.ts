import { commands, ExtensionContext, Uri } from "vscode";
import { Activatable } from "./activatable";
import { Commands } from "./commands";
import { Configuration } from "./configuration";
import { ConfigurationChangeAware } from "./configurationChangeAware";
import Explorer from "./explorer";
import { logger } from "./logging/logger";
import SQLite from "./sqlite";
import { Schema } from "./sqlite/schema";
import {
    pickListDatabase,
    pickWorkspaceDatabase,
    showErrorMessage,
} from "./vscodewrapper";

export class ExplorerCommandsHandler
    implements Activatable, ConfigurationChangeAware {
    private sqlite: SQLite;
    private explorer: Explorer;
    private databaseExtensions: string[];

    constructor(
        explorer: Explorer,
        sqlite: SQLite,
        databaseExtensions: string[]
    ) {
        this.sqlite = sqlite;
        this.explorer = explorer;
        this.databaseExtensions = databaseExtensions;
    }
    activate(extensionContext: ExtensionContext): void {
        extensionContext.subscriptions.push(
            commands.registerCommand(
                Commands.explorerAdd,
                this.onExplorerAdd,
                this
            ),
            commands.registerCommand(
                Commands.explorerRemove,
                this.onExplorerRemove,
                this
            ),
            commands.registerCommand(
                Commands.explorerRefresh,
                this.onExplorerRefresh,
                this
            )
        );
    }

    deactivate(): void {
        //
    }

    onConfigurationChange(configuration: Configuration) {
        this.databaseExtensions = configuration.databaseExtensions;
    }

    private onExplorerAdd(uri?: Uri): any {
        let dbPath = uri ? uri.fsPath : undefined;
        if (dbPath) {
            return this.sqlite.schema(dbPath).then(
                (schema) => {
                    return this.explorer.add(schema);
                },
                (err) => {
                    let message = `Failed to open database '${dbPath}': ${err.message}`;
                    logger.error(message);
                    showErrorMessage(message, {
                        title: "Show output",
                        command: Commands.showOutputChannel,
                    });
                }
            );
        } else {
            return pickWorkspaceDatabase(
                false,
                this.databaseExtensions,
                false
            ).then(
                (dbPath) => {
                    if (dbPath) return this.onExplorerAdd(Uri.file(dbPath));
                },
                (_onrejected) => {
                    // No database selected
                }
            );
        }
    }

    private onExplorerRemove(database?: Schema.Database): any {
        if (database) {
            return Promise.resolve(this.explorer.remove(database.path));
        } else {
            let dbList = this.explorer.list().map((db) => db.path);
            return pickListDatabase(false, dbList).then(
                (dbPath) => {
                    if (dbPath) this.explorer.remove(dbPath);
                },
                (_onrejected) => {
                    // fail silently
                }
            );
        }
    }

    private onExplorerRefresh(): any {
        let dbList = this.explorer.list();
        return Promise.all(
            dbList.map((db) => {
                let dbPath = db.path;
                return this.sqlite.schema(dbPath).then(
                    (schema) => {
                        return this.explorer.add(schema);
                    },
                    (err) => {
                        // remove the database from the explorer
                        this.explorer.remove(dbPath);
                        // show error message
                        let message = `Failed to refresh database: ${err.message}`;
                        logger.error(message);
                        showErrorMessage(message, {
                            title: "Show output",
                            command: Commands.showOutputChannel,
                        });
                    }
                );
            })
        );
    }
}
