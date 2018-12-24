import * as fs from 'fs';
import * as sqliteCommandValidation from '../../src/sqlite/sqliteCommandValidation';
import { platform } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';

describe("sqliteCommandValidation Tests", function () {

    afterAll(() => {
        removeFakeSqliteCommand();
    });

    test("isSqliteCommandValid should return true if the command/path passed as argument is valid", function() {
        let scriptPath = createFakeSqliteCommand(true);
        let actual = sqliteCommandValidation.isSqliteCommandValid(scriptPath);
        
        expect(actual).toBe(true);
    });
    
    test("isSqliteCommandValid should return false if the command/path passed as argument is not valid", function() {
        let scriptPath = createFakeSqliteCommand(false);
        let actual = sqliteCommandValidation.isSqliteCommandValid(scriptPath);
        
        expect(actual).toBe(false);
    });

    test("validateSqliteCommand should return the sqlite command passed as argument if it's valid", function() {
        let expected = createFakeSqliteCommand(true);
        
        let actual = sqliteCommandValidation.validateSqliteCommand(expected, "");
        
        expect(actual).toBe(expected);
    });

    test("validateSqliteCommand should throw exception if command passed as argument is not valid and fallback binary is not found", function() {
        let scriptPath = createFakeSqliteCommand(false);
        
        expect(() => {
            sqliteCommandValidation.validateSqliteCommand(scriptPath, "no");
        }).toThrow();
    });

    
    
});

function createFakeSqliteCommand(valid: boolean): string {
    let fileName = join(__dirname, "script");
    let text = "";
    if (valid) {
        text = `echo 3.26.0 2018-12-01 12:34:55`;
    }
    if (platform() === 'win32') {
        fileName += " space.bat";
    }
    fs.writeFileSync(fileName, text, 'utf8');

    if (platform() !== 'win32') {
        execSync(`chmod +x ${fileName}`);
    }

    return fileName;
}

function removeFakeSqliteCommand() {
    let path = join(__dirname, "script");
    if (platform() == 'win32') {
        path += " space.bat";
    }
    try {
        fs.unlinkSync(path);
    } catch(e) {

    }
}