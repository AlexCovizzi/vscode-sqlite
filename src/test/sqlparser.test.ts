
import * as assert from 'assert';
import * as sqlparser from '../database/sqlparser';

suite("SQLParser Tests", function () {

    test("Valid SQL Query with comments should return statements array", function() {
        let stmt1 = `SELECT * FROM company WHERE name = "company_name" LIMIT 5`;
        let stmt2 = `SELECT * FROM company WHERE name = "name_with_this_character;" GROUP BY time`;
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple \n lkines and also that has ; another\n line yeah*/`;
        let query = `${stmt1}; ${inline_comment}\n${stmt2};${multiline_comment}`;

        let stmts = sqlparser.SQLParser.parse(query);
        
        assert.deepStrictEqual(stmts, [stmt1, stmt2]);
    });

    test("Invalid SQL Query with only comments should return empty array", function() {
        let inline_comment = `-- comment on something before a new line`;
        let multiline_comment = `/* something that spans multiple \n lkines and also that has ; another\n line yeah*/`;
        let query = `${inline_comment}\n${multiline_comment}`;

        let stmts = sqlparser.SQLParser.parse(query);
        
        assert.deepStrictEqual(stmts, []);
    });
});