import * as queryParser from "../../../src/sqlite/queryParser";

describe("QueryParser Tests", function () {

    test("should return statements array when query is valid and has comments", function() {
        let stmt1 = `SELECT *\nFROM company\nWHERE name = "company\nname" LIMIT 5;`;
        let stmt2 = `SELECT * FROM company WHERE name = 'name_with_this_character;\n' GROUP BY time;`;
        let stmt3 = `.table company`;
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple \n lines and also that has ; another\n line yeah*/`;
        let query = ` \n${stmt1} ${inline_comment}\n    ${stmt2}${multiline_comment}\n${stmt3}`;

        let actual = queryParser.extractStatements(query);
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

        let actual = queryParser.extractStatements(query);
        let expected = [expected_stmt1, expected_stmt2];
        
        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("should return empty array if query has only comments", function() {
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple and double dash -- qualcosa\n  also that has ;and /* *\\/ another\n line yeah*/`;
        let query = `${inline_comment}\n${multiline_comment}`;

        let actual = queryParser.extractStatements(query);
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

        let actual = queryParser.extractStatements(query);
        let expected = ['select "a" as const;'];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("query of issue #11 should ignore the query that does not end with ;", function() {
        let query = `SELECT\n*\nFROM\nsqlite_master\n`;

        let actual = queryParser.extractStatements(query);
        let expected = ["SELECT\n*\nFROM\nsqlite_master;"];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("should parse string when quote is escaped", function() {
        let query = `SELECT * FROM sqlite_master WHERE name LIKE "ciao""hey";`;

        let actual = queryParser.extractStatements(query);
        let expected = ['SELECT * FROM sqlite_master WHERE name LIKE "ciao""hey";'];

        expect(actual.map(s => s.sql)).toEqual(expected);

        
        let query1 = `SELECT * FROM sqlite_master WHERE name LIKE """hey""";`;

        let actual1 = queryParser.extractStatements(query1);
        let expected1 = ['SELECT * FROM sqlite_master WHERE name LIKE """hey""";'];

        expect(actual1.map(s => s.sql)).toEqual(expected1);
    });

    test("should parse empty strings (\"\") correctely (issue #82)", function() {
        let query = `SELECT * FROM sqlite_master WHERE name LIKE "";`;

        let actual = queryParser.extractStatements(query);
        let expected = ['SELECT * FROM sqlite_master WHERE name LIKE "";'];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("should parse query with semicolon inside line comment (issue #167)", function() {
        let query = `SELECT * FROM table\nWHERE val < 3 -- comment ; with semicolon\nand var = 'a';`;

        let actual = queryParser.extractStatements(query);
        let expected = [query];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("should parse query with semicolon inside multiline comment (issue #167)", function() {
        let query = `SELECT * FROM table\nWHERE val < 3\n/* comment ; with\nsemicolon */\nand var = 'a';`;

        let actual = queryParser.extractStatements(query);
        let expected = [query];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("should parse query with TRIGGER and SELECT (issue #210)", function() {
        let query = `CREATE TRIGGER newWidgetSale BEFORE UPDATE ON widgetSale
        BEGIN
            SELECT RAISE(ROLLBACK, 'cannot update table "widget sale"') FROM widgetSale WHERE id = NEW.id and reconciled = 1;
        END
        ;`

        let actual = queryParser.extractStatements(query);
        let expected = [query];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });

    test("should parse query with transaction", function() {
        let query = `BEGIN TRANSACTION; -- start
        SELECT RAISE(ROLLBACK, 'cannot update table "widget sale"') FROM widgetSale WHERE id = NEW.id and reconciled = 1;
        END TRANSACTION;`

        let actual = queryParser.extractStatements(query);
        let expected = [
            "BEGIN TRANSACTION;",
            "SELECT RAISE(ROLLBACK, 'cannot update table \"widget sale\"') FROM widgetSale WHERE id = NEW.id and reconciled = 1;",
            "END TRANSACTION;"
        ];

        expect(actual.map(s => s.sql)).toEqual(expected);
    });


});