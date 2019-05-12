import { CompletionItemProvider, Position, TextDocument, CancellationToken, CompletionContext, CompletionItem, CompletionItemKind } from "vscode";
import { Schema } from "../common";
import { keywords } from './keywords';
import { uniqueBy } from "../utils/utils";

interface SchemaProvider {
    provideSchema: (doc: TextDocument) => Thenable<Schema|void>;
}

export class CompletionProvider implements CompletionItemProvider {

    private schemaMap: {[path: string]: Schema};
    
    constructor(private schemaProvider: SchemaProvider) {
        this.schemaMap = {};
    }

    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
        let schema = this.schemaMap[document.uri.fsPath];
        let promise = schema ? Promise.resolve(schema) : this.schemaProvider.provideSchema(document);
        return promise.then(schema => {
            if (!schema) return this.getKeywordCompletionItems(keywords);

            let items: CompletionItem[] = [];
            if (context.triggerCharacter === '.') {
                // when the trigger character is a dot we assume that we just need the columns
                let range = document.getWordRangeAtPosition(position.translate(0, -1));
                let tableName = document.getText(range);
                let table = schema ? schema.tables.find(tbl => tbl.name === tableName) : undefined;
                if (table) {
                    items = this.getColumnCompletionItems(table.columns);
                } else {
                    items = this.getColumnCompletionItems(schema.tables.reduce((acc, tbl) => acc.concat(tbl.columns), [] as Schema.Column[]));
                }
                return items;
            }
            let keywordItems = this.getKeywordCompletionItems(keywords);
            let tableItems = this.getTableCompletionsItems(schema.tables);
            let columnItems = this.getColumnCompletionItems(schema.tables.reduce((acc, tbl) => acc.concat(tbl.columns), [] as Schema.Column[]));

            return [...tableItems, ...columnItems, ...keywordItems];
        });
    }

    private getTableCompletionsItems(tables: Schema.Table[] = []) {
        let tableItems = tables.map(tbl => new TableCompletionItem(tbl.name));
        return tableItems;
    }

    private getColumnCompletionItems(columns: Schema.Column[] = [], noDuplicates: boolean = true) {
        let columnItems: ColumnCompletionItem[] = columns.map(col => new ColumnCompletionItem(col.name));
        if (noDuplicates) {
            columnItems = uniqueBy(columnItems, "label");
        }
        return columnItems;
    }

    private getKeywordCompletionItems(keywords: string[]) {
        let items: CompletionItem[] = keywords.map(word => new KeywordCompletionItem(word));
        return items;
    }
}

class KeywordCompletionItem extends CompletionItem {
    constructor(keyword: string) {
        super(keyword, CompletionItemKind.Keyword);
    }
}

class TableCompletionItem extends CompletionItem {
    constructor(name: string) {
        super(name, CompletionItemKind.File);
        this.detail = "table";
    }
}

class ColumnCompletionItem extends CompletionItem {
    constructor(name: string) {
        super(name, CompletionItemKind.Field);
        this.detail = "column";
    }
}