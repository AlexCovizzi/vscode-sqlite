export const window = {
    createStatusBarItem: jest.fn(),
    activeTextEditor: jest.fn(),

    showQuickPick: jest.fn(),

    onDidChangeActiveTextEditor: jest.fn(),
    onDidChangeTextEditorViewColumn: jest.fn(),

    createTreeView: jest.fn(),

    createOutputChannel: jest.fn()
};

export const workspace = {
    findFiles: jest.fn(),
    onDidOpenTextDocument: jest.fn(),
    onDidCloseTextDocument: jest.fn(),
};

export const commands = {
    executeCommand: jest.fn()
};

export const Disposable = {
    from: jest.fn()
};

export const CancellationTokenSource = jest.fn().mockImplementation(() => {
    return {
        token: jest.fn(),
        cancel: jest.fn(),
        dispose: jest.fn()
    };
});

export const StatusBarAlignment = jest.fn();

export const TextDocument = jest.fn().mockImplementation(() => {
    return {
        uri: {toString: jest.fn()},

    };
});

export const TreeItem = jest.fn();