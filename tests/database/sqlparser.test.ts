import * as sqlparser from '../../src/database/sqlparser';

describe("SQLParser Tests", function () {

    test("should return statements array when query is valid and has comments", function() {
        let stmt1_with_new_line = `SELECT *\nFROM company\nWHERE name = "company\nname" LIMIT 5;`;
        let stmt1 = `SELECT * FROM company WHERE name = "company\nname" LIMIT 5;`;
        let stmt2 = `SELECT * FROM company WHERE name = 'name_with_this_character;\n' GROUP BY time;`;
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple \n lines and also that has ; another\n line yeah*/`;
        let query = `${stmt1_with_new_line} ${inline_comment}\n${stmt2}${multiline_comment}`;

        let actual = sqlparser.SQLParser.parse(query);
        let expected = [stmt1, stmt2];

        expect(actual).toEqual(expected);
    });

    test("on Windows should return statements array when query is valid and has comments", function() {
        let stmt1_with_new_line = `SELECT *\r\nFROM company\nWHERE name = "company\r\nname" LIMIT 5;`;
        let stmt1 = `SELECT * FROM company WHERE name = "company\r\nname" LIMIT 5;`;
        let stmt2 = `SELECT * FROM company WHERE name = 'name_with_this_character;\r\n' GROUP BY time;`;
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple \r\n lines and also that has ; another\r\n line yeah*/`;
        let query = `${stmt1_with_new_line} ${inline_comment}\n${stmt2}${multiline_comment}`;

        let actual = sqlparser.SQLParser.parse(query);
        let expected = [stmt1, stmt2];
        
        expect(actual).toEqual(expected);
    });

    test("should return empty array if query has only comments", function() {
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple and double dash -- qualcosa\n  also that has ;and /* *\\/ another\n line yeah*/`;
        let query = `${inline_comment}\n${multiline_comment}`;

        let actual = sqlparser.SQLParser.parse(query);
        let expected = [];
        
        expect(actual).toEqual(expected);
    });

    test("query of issue #6", function() {
        let query = `/*
        SELECT name || ' --> ' || 'POST';
        FROM sqlite_master 
        LIMIT 1;
        */
       
       select "a" as const;`;

       let actual = sqlparser.SQLParser.parse(query);
       let expected = ['select "a" as const;'];

       expect(actual).toEqual(expected);
    });

    test("query of issue #11", function() {
        let query = `SELECT\n*\nFROM\nsqlite_master\n`;

        let actual = sqlparser.SQLParser.parse(query);
        let expected = ['SELECT * FROM sqlite_master;'];

        expect(actual).toEqual(expected);
    });
});