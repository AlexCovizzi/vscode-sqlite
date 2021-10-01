import { commands, ExtensionContext, Position, Uri } from "vscode";
import { Activatable } from "./activatable";
import { Commands } from "./commands";
import { Schema } from "./common";
import { Configuration } from "./configuration";
import { ConfigurationChangeAware } from "./configurationChangeAware";
import SqlWorkspace from "./sqlworkspace";
import { sqlSafeName } from "./utils/utils";
import {
    createSqlDocument,
    getEditorSqlDocument,
    pickWorkspaceDatabase,
} from "./vscodewrapper";

export class SqlDocumentCommandsHandler
    implements Activatable, ConfigurationChangeAware {
    private sqlWorkspace: SqlWorkspace;
    private databaseExtensions: string[];

    constructor(sqlWorkspace: SqlWorkspace, databaseExtensions: string[]) {
        this.sqlWorkspace = sqlWorkspace;
        this.databaseExtensions = databaseExtensions;
    }

    onConfigurationChange(configuration: Configuration) {
        this.databaseExtensions = configuration.databaseExtensions;
    }

    activate(extensionContext: ExtensionContext): void {
        extensionContext.subscriptions.push(
            commands.registerCommand(
                Commands.useDatabase,
                this.onUseDatabase,
                this
            ),
            commands.registerCommand(Commands.newQuery, this.onNewQuery, this),
            commands.registerCommand(
                Commands.newQuerySelect,
                this.onNewQuerySelect,
                this
            ),
            commands.registerCommand(
                Commands.newQueryInsert,
                this.onNewQueryInsert,
                this
            )
        );
    }

    deactivate(): void {
        //
    }

    private async onUseDatabase(): Promise<string> {
        let sqlDocument = getEditorSqlDocument();
        let dbPath = await pickWorkspaceDatabase(
            false,
            this.databaseExtensions,
            true
        );
        if (sqlDocument && dbPath) {
            this.sqlWorkspace.bindDatabaseToDocument(dbPath, sqlDocument);
        }
        return dbPath;
    }

    private async onNewQuery(database?: Schema.Database): Promise<Uri> {
        const sqlDocument = await createSqlDocument("");
        if (database) {
            this.sqlWorkspace.bindDatabaseToDocument(
                database.path,
                sqlDocument
            );
        }
        return sqlDocument.uri;
    }

    private async onNewQuerySelect(table: Schema.Table): Promise<Uri> {
        let contentL0 = `SELECT ${table.columns
            .map((c) => sqlSafeName(c.name))
            .join(", ")}`;
        let contentL1 = `FROM ${sqlSafeName(table.name)};`;
        let content = contentL0 + "\n" + contentL1;
        let cursorPos = new Position(1, contentL1.length - 1);
        const sqlDocument = await createSqlDocument(content, cursorPos);
        this.sqlWorkspace.bindDatabaseToDocument(table.database, sqlDocument);
        return sqlDocument.uri;
    }

    private async onNewQueryInsert(table: Schema.Table): Promise<Uri> {
        const columnsNotGenerated = table.columns.filter((c) => !c.generatedAlways);
        let contentL0 = `INSERT INTO ${sqlSafeName(
            table.name
        )} (${columnsNotGenerated.map((c) => sqlSafeName(c.name)).join(", ")})`;
        let contentL1 = `VALUES ();`;
        let content = contentL0 + "\n" + contentL1;
        // move the cursor inside the round brackets
        let cursorPos = new Position(1, contentL1.length - 2);
        const sqlDocument = await createSqlDocument(content, cursorPos);
        this.sqlWorkspace.bindDatabaseToDocument(table.database, sqlDocument);
        return sqlDocument.uri;
    }
}
