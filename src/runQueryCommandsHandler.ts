import { commands, ExtensionContext, Position, Range } from "vscode";
import { Activatable } from "./activatable";
import { Commands } from "./commands";
import { Schema } from "./common";
import { Configuration } from "./configuration";
import { ConfigurationChangeAware } from "./configurationChangeAware";
import { logger } from "./logging/logger";
import ResultView from "./resultview";
import SQLite from "./sqlite";
import { extractStatements } from "./sqlite/queryParser";
import SqlWorkspace from "./sqlworkspace";
import { sqlSafeName } from "./utils/utils";
import {
    getEditorSelection,
    getEditorSqlDocument,
    pickWorkspaceDatabase,
    showErrorMessage,
    showQueryInputBox,
} from "./vscodewrapper";

export class RunQueryCommandsHandler
    implements Activatable, ConfigurationChangeAware {
    private sqlWorkspace: SqlWorkspace;
    private sqlite: SQLite;
    private resultView: ResultView;
    private recordsPerPage: number;
    private databaseExtensions: string[];

    constructor(
        sqlWorkspace: SqlWorkspace,
        sqlite: SQLite,
        resultView: ResultView,
        recordsPerPage: number,
        databaseExtensions: string[]
    ) {
        this.sqlWorkspace = sqlWorkspace;
        this.sqlite = sqlite;
        this.resultView = resultView;
        this.recordsPerPage = recordsPerPage;
        this.databaseExtensions = databaseExtensions;
    }

    onConfigurationChange(configuration: Configuration): void {
        this.recordsPerPage = configuration.recordsPerPage;
        this.databaseExtensions = this.databaseExtensions;
    }

    activate(extensionContext: ExtensionContext): void {
        extensionContext.subscriptions.push(
            commands.registerCommand(
                Commands.runDocumentQuery,
                this.onRunDocumentQuery,
                this
            ),
            commands.registerCommand(
                Commands.runSelectedQuery,
                this.onRunSelectedQuery,
                this
            ),
            commands.registerCommand(
                Commands.runTableQuery,
                this.onRunTableQuery,
                this
            ),
            commands.registerCommand(
                Commands.runSqliteMasterQuery,
                this.onRunSqliteMasterQuery,
                this
            ),
            commands.registerCommand(
                Commands.quickQuery,
                this.onQuickQuery,
                this
            )
        );
    }

    deactivate(): void {
        //
    }

    private onRunDocumentQuery() {
        const sqlDocument = getEditorSqlDocument();
        if (!sqlDocument) return;
        const dbPath = this.sqlWorkspace.getDocumentDatabase(sqlDocument);
        if (dbPath) {
            const query = sqlDocument.getText();
            this.runQuery(dbPath, query);
        } else {
            commands
                .executeCommand(Commands.useDatabase)
                .then(() => this.onRunDocumentQuery());
        }
    }

    private onRunSelectedQuery() {
        let sqlDocument = getEditorSqlDocument();
        if (!sqlDocument) return;
        let dbPath = this.sqlWorkspace.getDocumentDatabase(sqlDocument);
        if (dbPath) {
            let selection = getEditorSelection();
            let query = "";
            if (!selection) {
                query = sqlDocument.getText();
            } else if (selection.isEmpty) {
                let text = sqlDocument.getText();
                let statements = extractStatements(text);
                // find the statement that includes the selection
                for (let stmt of statements) {
                    let stmtStartPosition = new Position(
                        stmt.position.start[0],
                        stmt.position.start[1]
                    );
                    let stmtEndPosition = new Position(
                        stmt.position.end[0],
                        stmt.position.end[1] + 1
                    );
                    let stmtRange = new Range(
                        stmtStartPosition,
                        stmtEndPosition
                    );
                    if (stmtRange.contains(selection)) {
                        query = stmt.sql;
                        break;
                    }
                }
            } else {
                query = sqlDocument.getText(selection);
            }
            if (query != "") {
                this.runQuery(dbPath, query);
            } else {
                let message = `No query selected.`;
                showErrorMessage(message, {
                    title: "Show output",
                    command: Commands.showOutputChannel,
                });
            }
        } else {
            commands
                .executeCommand(Commands.useDatabase)
                .then(() => this.onRunSelectedQuery());
        }
    }

    private onRunTableQuery(table: Schema.Table) {
        let query = `SELECT * FROM ${sqlSafeName(table.name)};`;
        this.runQuery(table.database, query);
    }

    private onRunSqliteMasterQuery(database: Schema.Database) {
        let query = `SELECT * FROM sqlite_master;`;
        this.runQuery(database.path, query);
    }

    private onQuickQuery() {
        pickWorkspaceDatabase(false, this.databaseExtensions, true).then(
            (dbPath) => {
                if (dbPath) {
                    showQueryInputBox(dbPath).then((query) => {
                        if (query) this.runQuery(dbPath, query);
                    });
                }
            }
        );
    }

    private runQuery(dbPath: string, query: string) {
        let resultSet = this.sqlite
            .query(dbPath, query)
            .then(({ resultSet, error }) => {
                // log and show if there is any error
                if (error) {
                    logger.error(error.message);
                    showErrorMessage(error.message, {
                        title: "Show output",
                        command: Commands.showOutputChannel,
                    });
                }

                return resultSet;
            });
        this.resultView.display(resultSet, this.recordsPerPage);
    }
}
