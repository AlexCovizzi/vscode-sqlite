import * as vscode from 'vscode';
import * as quickpick from '../../../src/vscodewrapper/quickpick';

jest.mock('vscode');

describe('quickpick.ts', () => {

    describe('showAutoQuickpick', () => {

        beforeEach(() => {
            (vscode.window.showQuickPick as jest.Mock).mockClear();
        });

        test('should return a promise that resolves to an item if multiple items are passed as argument and one is choosen', (done) => {
            const items = [{label: "item0"}, {label: "item1"}, {label: "item2"}];
            let item = items[Math.floor(Math.random()*items.length)];

            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(item);
            
            quickpick.showAutoQuickPick(false, Promise.resolve(items)).then(item => {
                expect(items).toContainEqual(item);

                done();
            });
        });

        test('should return a promise that resolves to undefined if no item is choosen', (done) => {
            const items = [{label: "item0"}, {label: "item1"}, {label: "item2"}];

            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            
            quickpick.showAutoQuickPick(false, Promise.resolve(items)).then(item => {
                expect(item).toBeUndefined();

                done();
            });
        });

        test('should return the only item if autopick is true and a list of one item is passed', (done) => {
            const items = [{label: "item0"}];
            
            quickpick.showAutoQuickPick(true, items).then(item => {
                expect(item).toEqual(items[0]);

                done();
            });
        });

        test('should not call vscode.window.showQuickPick if autopick is true and a list of one item is passed', () => {
            // there is no need to call showQuickPick if only one item is passed and autopick is true
            const items = [{label: "item0"}];

            quickpick.showAutoQuickPick(true, items);

            expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
        });

        test('should return the only item if autopick is true, a promise that resolves to an item is passed and no item is choosen', (done) => {
            const items = [{label: "item0"}];

            // we dont use showQuickPick.mockResolvedValue, that is no element is choosen

            quickpick.showAutoQuickPick(true, Promise.resolve(items)).then(item => {
                expect(item).toEqual(items[0]);

                done();
            });
        });
    });

    describe("pickWorkspaceDatabase", () => {

        test("should return a promise that resolves to a string if a valid item is choosen", (done) => {
            const dbUriList = [{fsPath: "dbPath1"}, {fsPath: "dbPath2"}];
            const dbPath = dbUriList[0].fsPath;

            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(dbUriList);
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(new quickpick.QuickPick.DatabaseItem(dbPath));

            quickpick.pickWorkspaceDatabase(false).then(item => {
                expect(item).toBe(dbPath);

                done();
            });
        });
    });
});