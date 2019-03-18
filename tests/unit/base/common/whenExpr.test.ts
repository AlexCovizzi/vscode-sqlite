import * as whenExpr from "../../../../src/base/common/whenExpr";

describe("whenExpr.ts", () => {

    describe("createWhenExpr", function () {

        test("should create an Expression based on the string passed as argument", function() {
            let str = " table == hello || column  != not  && is_ok";

            let expected: whenExpr.Expression = [
                {variable: "table", comparator: whenExpr.Comparator.EQUAL, value: "hello"},
                whenExpr.Operator.OR,
                {variable: "column", comparator: whenExpr.Comparator.NOT_EQUAL, value: "not"},
                whenExpr.Operator.AND,
                {variable: "is_ok"}
            ];
            let actual = whenExpr.WhenExpr.parse(str).expression;
            
            expect(actual).toEqual(expected);
        });

        test("should create an Expression with a single clause if there is only one variable", function() {
            let str = "is_ok";

            let expected: whenExpr.Expression = [
                {variable: "is_ok"}
            ];
            let actual = whenExpr.WhenExpr.parse(str).expression;
            
            expect(actual).toEqual(expected);
        });

        test("should create an Expression with a single clause if there is only one variable", function() {
            let str = "is_ok";

            let expected: whenExpr.Expression = [
                {variable: "is_ok"}
            ];
            let actual = whenExpr.WhenExpr.parse(str).expression;
            
            expect(actual).toEqual(expected);
        });

        test("should throw an error if the expression is not valid", function() {
            let str_1 = "is_not_ok &&";
            expect(() => { whenExpr.WhenExpr.parse(str_1); }).toThrow();
            let str_2 = "&& is_not_ok";
            expect(() => { whenExpr.WhenExpr.parse(str_2); }).toThrow();
            let str_3 = "table ==";
            expect(() => { whenExpr.WhenExpr.parse(str_3); }).toThrow();
            let str_4 = "table == ciao ||";
            expect(() => { whenExpr.WhenExpr.parse(str_4); }).toThrow();
            let str_5 = "&& table == ciao || hell";
            expect(() => { whenExpr.WhenExpr.parse(str_5); }).toThrow();
            let str_6 = "table== ciao || hello";
            expect(() => { whenExpr.WhenExpr.parse(str_6); }).toThrow();
            let str_7 = "table == ciao ||hello";
            expect(() => { whenExpr.WhenExpr.parse(str_7); }).toThrow();
        });

    });

    describe("WhenExpr.verify", function () {

        test("should return true if the expression with two clauses is true", function() {
            let str = "table == hello && column != not";
            let values = {table: "hello", column: "not_not"};

            let actual = whenExpr.WhenExpr.parse(str).verify(values);
            
            expect(actual).toBeTruthy();
        });

        test("should return true if the expression with one clause is truthy", function() {
            let str = "is_ok";
            let values = {is_ok: "truthy"};

            let actual = whenExpr.WhenExpr.parse(str).verify(values);
            
            expect(actual).toBeTruthy();
        });

        test("should return false if the variable of the clause does not exist", function() {
            let str = "is_not_ok";
            let values = {};

            let actual = whenExpr.WhenExpr.parse(str).verify(values);
            
            expect(actual).toBeFalsy();
        });

        test("should return false if the expression with three clauses is false", function() {
            let str = "table == hello && column != not || is_ok";
            let values = {table: "not_hello", column: "not"};

            let actual = whenExpr.WhenExpr.parse(str).verify(values);
            
            expect(actual).toBeFalsy();
        });

    });
});