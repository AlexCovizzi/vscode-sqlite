import { CompletionItemProvider, Position, TextDocument, CancellationToken, CompletionContext, CompletionItem, CompletionItemKind } from "vscode";
import { Schema } from "../interfaces";
import { keywords } from './keywords';

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
        if (schema) {
            let items = this.getCompletionItems(keywords, schema.tables);
            return items;
        } else {
            return this.schemaProvider.provideSchema(document).then(schema => {
                let items = this.getCompletionItems(keywords, schema? schema.tables : undefined);
                return items;
            });
        }
    }

    private getCompletionItems(keywords: string[], tables?: Schema.Table[]) {
        let items: CompletionItem[] = keywords.map(word => new KeywordCompletionItem(word));
        if (tables) {
            let tableItems = tables.map(tbl => new TableCompletionItem(tbl.name));
            let columnItems: ColumnCompletionItem[] = [];
            tables.forEach(tbl => {
                columnItems.push(...tbl.columns.map(col => new ColumnCompletionItem(`${tbl.name}.${col.name}`)));
            });

            items.push(...tableItems, ...columnItems);
        }
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
    }
}

class ColumnCompletionItem extends CompletionItem {
    constructor(name: string) {
        super(name, CompletionItemKind.Field);
    }
}