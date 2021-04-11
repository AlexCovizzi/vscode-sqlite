import { Disposable, languages, TextDocument, DocumentSelector } from 'vscode';
import { CompletionProvider } from './completionProvider';
import { Schema } from '../common';

export default class LanguageServer implements Disposable {
    private subscriptions: Disposable[];
    private schemaProvider?: (doc: TextDocument) => Thenable<Schema|void>;
    private completionProvider: CompletionProvider;

    constructor() {
        this.subscriptions = [];

        this.completionProvider = new CompletionProvider({
            provideSchema: (doc) => {
                if (this.schemaProvider) return this.schemaProvider(doc);
                else return Promise.resolve();
            }
        });

        let documentSelector: DocumentSelector = [{ language: 'sql' }, { language: 'sqlite' }];
        this.subscriptions.push(languages.registerCompletionItemProvider(documentSelector, this.completionProvider, '.'));
    }

    setSchemaProvider(schemaProvider: (doc: TextDocument) => Thenable<Schema|void>) {
        this.schemaProvider = schemaProvider;
    }

    dispose() {
        Disposable.from(...this.subscriptions).dispose();
    }
}