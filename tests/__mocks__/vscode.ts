
export const window = {
    createStatusBarItem: jest.fn(),
    showQuickPick: jest.fn()
};

export const CancellationTokenSource = jest.fn().mockImplementation(() => {
    return {
        token: jest.fn(),
        cancel: jest.fn(),
        dispose: jest.fn()
    };
});

export const workspace = {
    findFiles: jest.fn()
}