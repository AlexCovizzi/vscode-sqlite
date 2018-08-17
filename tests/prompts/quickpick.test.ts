import * as vscode from 'vscode';
import * as quickpick from '../../src/prompts/quickpick';

jest.mock('vscode', () => ({
    window: {
        showQuickPick: jest.fn()
    },
    CancellationTokenSource: jest.fn(),
}));

describe('quickpick.ts', () => {

    describe('showAutoQuickpick', () => {

        beforeEach(() => {
            (vscode.window.showQuickPick as jest.Mock).mockClear();
            (vscode.CancellationTokenSource as any).mockClear();
        });

        test('should return a promise that resolves to an item if multiple items are passed as argument and one is choosen', () => {
            const items = [{label: "item0"}, {label: "item1"}, {label: "item2"}];
            let item = items[Math.floor(Math.random()*items.length)];

            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(item);
            
            quickpick.showAutoQuickPick(false, Promise.resolve(items)).then(item => {
                expect(items).toContainEqual(item);
            });
        });

        test('should return a promise that resolves to undefined if no item is choosen', () => {
            const items = [{label: "item0"}, {label: "item1"}, {label: "item2"}];

            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            
            quickpick.showAutoQuickPick(false, Promise.resolve(items)).then(item => {
                expect(item).toBeUndefined();
            });
        });

        test('should return the only item if autopick is true and an item is passed', () => {
            const items = [{label: "item0"}];
            
            quickpick.showAutoQuickPick(true, items).then(item => {
                expect(item).toEqual(items[0]);
            });
        });

        test('should return the only item if autopick is true and a promise that resolves to an item is passed', () => {
            const items = [{label: "item0"}];

            quickpick.showAutoQuickPick(true, Promise.resolve(items)).then(item => {
                expect(item).toEqual(items[0]);
            });
        });

        test('should not call vscode.window.showQuickPick if autopick is true and an item is passed', () => {
            const items = [{label: "item0"}];

            quickpick.showAutoQuickPick(true, items);

            expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
        });

        test('should call vscode.CancellationTokenSource.cancel if autopick is true and a promise that resolves to an item is passed', () => {
            const items = [{label: "item0"}];

            const mockCancel = jest.fn();
            (vscode.CancellationTokenSource as any) = jest.fn().mockImplementation(() => {
                return {
                    cancel: mockCancel,
                    dispose: jest.fn(),
                    token: jest.fn()
                };
            });

            quickpick.showAutoQuickPick(true, Promise.resolve(items));

            expect(vscode.window.showQuickPick).toHaveBeenCalled();

            expect(vscode.CancellationTokenSource).toHaveBeenCalled();

            expect(mockCancel).toHaveBeenCalled();
        });
    });
});