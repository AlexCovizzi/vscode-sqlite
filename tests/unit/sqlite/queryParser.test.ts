import * as queryParser from "../../../src/sqlite/queryParser";

describe("QueryParser Tests", function () {

    test("should return statements array when query is valid and has comments", function() {
        let stmt1 = `SELECT *\nFROM company\nWHERE name = "company\nname" LIMIT 5;`;
        let stmt2 = `SELECT * FROM company WHERE name = 'name_with_this_character;\n' GROUP BY time;`;
        let stmt3 = `.table company`;
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple \n lines and also that has ; another\n line yeah*/`;
        let query = ` \n${stmt1} ${inline_comment}\n    ${stmt2}${multiline_comment}\n${stmt3}`;

        let actual = queryParser.getStatements(query);
        let expected = [stmt1, stmt2, stmt3];

        expect(actual.map(stmt => stmt.sql)).toEqual(expected);
    });

    test("on Windows should return statements array when query is valid and has comments", function() {
        let stmt1 = `SELECT * FROM company\r\n WHERE name = "company\r\nname" LIMIT 5;`;
        let stmt2 = `SELECT * FROM company WHERE name = 'name_with_this_character;\r\n' GROUP BY time;`;
        let expected_stmt1 = `SELECT * FROM company\n WHERE name = "company\nname" LIMIT 5;`;
        let expected_stmt2 = `SELECT * FROM company WHERE name = 'name_with_this_character;\n' GROUP BY time;`;
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple \r\n lines and also that has ; another\r\n line yeah*/`;
        let query = ` \t${stmt1} ${inline_comment}\n ${stmt2}${multiline_comment}`;

        let actual = queryParser.getStatements(query);
        let expected = [expected_stmt1, expected_stmt2];
        
        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("should return empty array if query has only comments", function() {
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple and double dash -- qualcosa\n  also that has ;and /* *\\/ another\n line yeah*/`;
        let query = `${inline_comment}\n${multiline_comment}`;

        let actual = queryParser.getStatements(query);
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

        let actual = queryParser.getStatements(query);
        let expected = ['select "a" as const;'];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("query of issue #11 should ignore the query that does not end with ;", function() {
        let query = `SELECT\n*\nFROM\nsqlite_master\n`;

        let actual = queryParser.getStatements(query);
        let expected = ["SELECT\n*\nFROM\nsqlite_master;"];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });
});