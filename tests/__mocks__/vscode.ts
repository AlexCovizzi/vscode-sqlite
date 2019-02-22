export const window = {
    createStatusBarItem: jest.fn().mockReturnValue({
        command: "command",
        tooltip: "tooltip",
        text: "text",
        show: jest.fn()
    }),
    activeTextEditor: jest.fn(),

    showQuickPick: jest.fn(),
    showErrorMessage: jest.fn(() => Promise.resolve()),

    onDidChangeActiveTextEditor: jest.fn(),
    onDidChangeTextEditorViewColumn: jest.fn(),

    createTreeView: jest.fn(),

    createOutputChannel: jest.fn().mockReturnValue({
        show: jest.fn(),
        appendLine: jest.fn()
    })
};

export const workspace = {
    findFiles: jest.fn(),
    onDidOpenTextDocument: jest.fn(),
    onDidCloseTextDocument: jest.fn(),
    onDidChangeConfiguration: jest.fn(),
    getConfiguration: jest.fn(() => ({get: jest.fn()}))
};

export const commands = {
    executeCommand: jest.fn(),
    registerCommand: jest.fn()
};

export const ExtensionContext = jest.fn();

export const Disposable = {
    from: jest.fn()
};

export const EventEmitter = jest.fn().mockImplementation(() => {
    let event = jest.fn();
    return {
        event: event,
        fire: jest.fn().mockImplementation(() => {
            // Is this even correct??
            event();
        })
    };
});

export const CancellationTokenSource = jest.fn().mockImplementation(() => {
    return {
        token: jest.fn(),
        cancel: jest.fn(),
        dispose: jest.fn()
    };
});

export const CompletionItem = jest.fn();

export const StatusBarAlignment = jest.fn();

export const TextDocument = jest.fn().mockImplementation(() => {
    return {
        uri: {toString: jest.fn()},
    };
});

export const TreeItem = jest.fn();

export namespace TreeItemCollapsibleState {
    export const None = 0;
    export const Collapsed = 1;
    export const Expanded = 2;
}

export namespace languages {
    export const registerCompletionItemProvider = jest.fn();
}