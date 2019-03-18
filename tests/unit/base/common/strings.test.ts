import * as strings from "../../../../src/base/common/strings";

describe("strings.ts", () => {

    describe("replaceVariableWithValue", function () {

        test("should replace ${[variable]} with the value of the variable", function() {
            let str = "hello ${name}, how are ${who_is}?";
            let values = {name: "Alex", who_is: "you"};

            let expected = "hello Alex, how are you?";
            let actual = strings.replaceVariableWithValue(str, values);
            
            expect(actual).toBe(expected);
        });

        test("should replace ${[variable]} with an empty value if the variable is not defined", function() {
            let str = "hello ${name}!";
            let values = {};

            let expected = "hello !";
            let actual = strings.replaceVariableWithValue(str, values);
            
            expect(actual).toBe(expected);
        });

        test("should do nothing if there is no ${}", function() {
            let str = "hello Alex!";
            let values = {name: "Alex"};

            let expected = "hello Alex!";
            let actual = strings.replaceVariableWithValue(str, values);
            
            expect(actual).toBe(expected);
        });
    });
});