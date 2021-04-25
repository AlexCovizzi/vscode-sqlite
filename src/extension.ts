"use strict";

import { ExtensionContext, commands, workspace } from "vscode";
import { logger } from "./logging/logger";
import { getConfiguration, Configuration } from "./configuration";
import { Constants } from "./constants/constants";
import SqlWorkspace from "./sqlworkspace";
import SQLite from "./sqlite";
import ResultView from "./resultview";
import LanguageServer from "./languageserver";
import Explorer from "./explorer";
import { Commands } from "./commands";
import { WorkspaceTrustCommandsHandler } from "./workspaceTrustCommandsHandler";
import { OutputChannelCommandsHandler } from "./outputChannelCommandsHandler";
import { ClipboardCommandsHandler } from "./clipboardCommandsHandler";
import { SqlDocumentCommandsHandler } from "./sqlDocumentCommandsHandler";
import { RunQueryCommandsHandler } from "./runQueryCommandsHandler";
import { ExplorerCommandsHandler } from "./explorerCommandsHandler";
import { isConfigurationChangeAware } from "./configurationChangeAware";
import { Activatable } from "./activatable";

let configuration: Configuration;
let languageserver: LanguageServer;
let sqlWorkspace: SqlWorkspace;
let sqlite: SQLite;
let explorer: Explorer;
let resultView: ResultView;
let activatables: Array<Activatable> = new Array();

export function activate(extensionContext: ExtensionContext): Promise<boolean> {
    logger.info(
        `Activating extension ${Constants.extensionName} v${Constants.extensionVersion}...`
    );

    // load configuration and reload every time it's changed
    // TODO: Improve the configuration handling
    configuration = getConfiguration(extensionContext);
    logger.setLogLevel(configuration.logLevel);

    extensionContext.subscriptions.push(
        commands.registerCommand(Commands.reloadSettings, () => {
            configuration = getConfiguration(extensionContext);
            logger.setLogLevel(configuration.logLevel);
            sqlite.setSqliteCommand(configuration.sqlite3);
            for (let activatable of activatables) {
                if (isConfigurationChangeAware(activatable)) {
                    activatable.onConfigurationChange(configuration);
                }
            }
        })
    );

    extensionContext.subscriptions.push(
        workspace.onDidChangeConfiguration(() => {
            commands.executeCommand(Commands.reloadSettings);
        })
    );

    sqlWorkspace = new SqlWorkspace();
    sqlite = new SQLite(extensionContext.extensionPath, configuration.sqlite3);
    resultView = new ResultView(extensionContext.extensionPath);
    languageserver = new LanguageServer();
    explorer = new Explorer(extensionContext);

    languageserver.setSchemaProvider((doc) => {
        let dbPath = sqlWorkspace.getDocumentDatabase(doc);
        if (dbPath) return sqlite.schema(dbPath);
        else return Promise.resolve();
    });

    extensionContext.subscriptions.push(
        languageserver,
        sqlWorkspace,
        sqlite,
        explorer,
        resultView
    );

    activatables.push(
        new WorkspaceTrustCommandsHandler(extensionContext),
        new OutputChannelCommandsHandler(),
        new ClipboardCommandsHandler(),
        new SqlDocumentCommandsHandler(
            sqlWorkspace,
            configuration.databaseExtensions
        ),
        new RunQueryCommandsHandler(
            sqlWorkspace,
            sqlite,
            resultView,
            configuration.recordsPerPage,
            configuration.databaseExtensions,
            configuration.setupDatabase
        ),
        new ExplorerCommandsHandler(
            explorer,
            sqlite,
            configuration.databaseExtensions
        )
    );

    for (let activatable of activatables) {
        activatable.activate(extensionContext);
    }

    logger.info(`Extension activated.`);
    return Promise.resolve(true);
}

// this method is called when your extension is deactivated
export function deactivate() {
    for (let activatable of activatables) {
        activatable.deactivate();
    }
    activatables = new Array();
}
