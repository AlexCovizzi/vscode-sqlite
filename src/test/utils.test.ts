import * as assert from 'assert';
import * as utils from '../utils/utils';

suite("findNotInString Tests", function () {

    test("string with new lines inside quotes should return indexes of new lines not in quotes", function() {
        let char = '\n';
        let stmt1 = `SELECT * FROM company WHERE name = "something with \n new line" LIMIT 5`;
        let stmt2 = `SELECT * FROM company WHERE name = 'something \n else with new line' GROUP BY time`;
        let stmt3 = `SELECT * FROM users WHERE name = 'something \n else with'' new line'`;
        let str = `${stmt1}\n${stmt2}\n${stmt3}`;

        let expected = [stmt1.length, stmt1.length+stmt2.length+1];
        let actual = utils.findNotInString(char, str);
        
        assert.deepStrictEqual(actual, expected);
    });
});

suite("splitNotInString Tests", function () {

    test("string with new lines inside quotes should return substrings where new lines", function() {
        let char = '\n';
        let stmt1 = `SELECT * FROM company WHERE name = "something with \n new line" LIMIT 5`;
        let stmt2 = `SELECT * FROM company WHERE name = 'something \n else with new line' GROUP BY time`;
        let stmt3 = `SELECT * FROM users WHERE name = 'something \n else with'' new line'`;
        let str = `${stmt1}\n${stmt2}\n${stmt3}`;

        let expected = [stmt1, stmt2, stmt3];
        let actual = utils.splitNotInString(char, str);
        
        assert.deepStrictEqual(actual, expected);
    });

    test("strings in quotes separated by new lines should return strings", function() {
        let char = '\n';
        let substr1 = `"string in quotes"`;
        let substr2 = `"another string in quotes" "with another one"`;
        let substr3 = `"lets make it tree fidde"'`;
        let str = `${substr1}\n${substr2}\n${substr3}`;

        let expected = [substr1, substr2, substr3];
        let actual = utils.splitNotInString(char, str);
        
        assert.deepStrictEqual(actual, expected);
    });

    test("strings in quotes separated by windows new lines should return strings", function() {
        let char = '\r\n';
        let substr1 = `"string in quotes"`;
        let substr2 = `"another string in quotes" "with another one"`;
        let substr3 = `"lets make it tree fidde"'`;
        let str = `${substr1}${char}${substr2}${char}${substr3}`;

        let expected = [substr1, substr2, substr3];
        let actual = utils.splitNotInString(char, str);
        
        assert.deepStrictEqual(actual, expected);
    });
});