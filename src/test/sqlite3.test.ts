import * as assert from 'assert';
import * as sqlite3 from '../database/sqlite3';

suite("SQLite3.parseOutput Tests", function () {

    test("string followed by string inside quotes should return first string as statement and rest as rows", function() {
        let stmt = `SELECT * FROM company WHERE name = "company_name" LIMIT 5;`;
        let row11 = `this is the first element of the first row`;
        let row12 = `this is the second element of the first row`;
        let row21 = `this is the first element of the second row`;
        let row22 = `this is the second element of the second row`;
        let str = `${stmt}\n"${row11}" "${row12}"\n"${row21}" "${row22}"`;
        
        let expected = [{stmt: stmt, rows: [[row11, row12],[row21, row22]]}];
        let actual = sqlite3.SQLite.parseOutput(str);
        
        assert.deepStrictEqual(actual, expected);
    });

    test("strings separated by semicolon should return both as stmt", function() {
        let stmt1 = `SELECT * FROM company WHERE name = "com\npany_name" LIMIT 5;`;
        let stmt2 = `SELECT * FROM user_agent where name like '%\n' LIMIT 2;`;
        let row = `this is the element of the row`;
        let stmt3 = `SELECT * FROM user;`;
        let str = `${stmt1}\n${stmt2}\n"${row}"\n${stmt3}`;
        
        let expected = [{stmt: stmt1, rows: []}, {stmt: stmt2, rows:[[row]]}, {stmt: stmt3, rows: []}];
        let actual = sqlite3.SQLite.parseOutput(str);
        
        assert.deepStrictEqual(actual, expected);
    });
});