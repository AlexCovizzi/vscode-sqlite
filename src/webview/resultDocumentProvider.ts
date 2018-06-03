import { TextDocumentContentProvider, CancellationToken, Uri, EventEmitter } from "vscode";
import { QueryResultStore } from "./resultStore";
import { Constants } from "../constants/constants";
import { QueryResultFormatter } from "./resultFormatter";

export default class QueryResultDocumentProvider implements TextDocumentContentProvider {

    private _onDidChange = new EventEmitter<Uri>();
    private resultFormatter: QueryResultFormatter;

    constructor(private queryResultStore: QueryResultStore) {
        this.resultFormatter = new QueryResultFormatter();
    }

    get onDidChange() {
		return this._onDidChange.event;
    }

    provideTextDocumentContent(uri: Uri, token: CancellationToken): string | Thenable<string> {
        let startId = Constants.queryResultPrefix.length + 1;
        let resultId = uri.path.substring(startId, startId + Constants.queryResultIdLength);
        let queryResult = this.queryResultStore.get(resultId);
        const content = this.resultFormatter.formatToJSON(queryResult);

        return content;
    }

    /**
     * {scheme}:{prefix}-{id}.{extension}
     */
    static generateDocumentUri(id: string) {
        return Uri.parse(`${Constants.queryResultScheme}:${Constants.queryResultPrefix}-${id}.${Constants.queryResultExtension}`);
    }
}