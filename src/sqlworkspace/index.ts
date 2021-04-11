import { TextDocument, Disposable } from "vscode";
import { DocumentDatabaseBindings } from "./documentDatabaseBindings";
import { DatabaseStatusBarItem } from "./databaseStatusBarItem";

class SqlWorkspace implements Disposable {
    private disposable: Disposable;

    private documentDatabaseBindings: DocumentDatabaseBindings;
    private databaseStatusBarItem: DatabaseStatusBarItem;

    constructor() {
        let subscriptions = [];

        this.documentDatabaseBindings = new DocumentDatabaseBindings();
        this.databaseStatusBarItem = new DatabaseStatusBarItem(
            this.documentDatabaseBindings
        );

        subscriptions.push(this.documentDatabaseBindings);
        subscriptions.push(this.databaseStatusBarItem);

        this.disposable = Disposable.from(...subscriptions);
    }

    bindDatabaseToDocument(
        databasePath: string,
        sqlDocument: TextDocument
    ): boolean {
        let success = this.documentDatabaseBindings.bind(
            sqlDocument,
            databasePath
        );
        if (success) {
            this.databaseStatusBarItem.update();
        }
        return success;
    }

    getDocumentDatabase(sqlDocument: TextDocument): string | undefined {
        return this.documentDatabaseBindings.get(sqlDocument);
    }

    dispose() {
        this.disposable.dispose();
    }
}

export default SqlWorkspace;
