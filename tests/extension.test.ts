
jest.mock('../src/utils/utils', () => ({
    sanitizeStringForHtml: jest.fn().mockReturnValue('ciao')
}));

import * as vscode from 'vscode';
import { sanitizeStringForHtml } from '../src/utils/utils';

describe('Extension tests', () => {

    test('Test di prova', () => {
        expect(sanitizeStringForHtml('ciao')).toBe('ciao');
    });

    test('mock di prova', () => {
        let result = vscode.window.createStatusBarItem();
        expect(result).toBe('ciao');
    });
});