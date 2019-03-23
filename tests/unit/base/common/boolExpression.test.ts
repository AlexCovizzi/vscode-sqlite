import {BoolExpression, Comparator, Operator, Clause } from "../../../../src/base/common/boolExpression";

describe("boolExpression.ts", () => {
    describe("compile", () => {
        test("compile should return an operation between two clause if the string passed as argument matches '[Clause] [Op] [Clause]'", function() {
            let str = "name == Alex && isOk";
            let expected = {
                operator: Operator.AND,
                left: {variable: "name", comparator: Comparator.EQUAL, value: "Alex"},
                right: {variable: "isOk"}
            };
            let actual = BoolExpression.compile(str);
            expect(actual).toEqual(expected);
        });

        test("compile should return the clause if the string passed as argument matches '[clause]'", function() {
            let str = "name == Alex";
            let expected = {variable: "name", comparator: Comparator.EQUAL, value: "Alex"};
            let actual = BoolExpression.compile(str);
            expect(actual).toEqual(expected);
        });

        test("compile should return an operation between a clause and an expression if the string passed as argument matches '[Clause] [Op] [Clause] [Op] [Clause]'", function() {
            let str = "isOk && name ==Alex || lastname !=Covizzi";
            let expected = {
                operator: Operator.AND,
                left: {variable: "isOk"},
                right: {
                    operator: Operator.OR,
                    left: {variable: "name", comparator: Comparator.EQUAL, value: "Alex"},
                    right: {variable: "lastname", comparator: Comparator.NOT_EQUAL, value: "Covizzi"},
                }
            };
            let actual = BoolExpression.compile(str);
            expect(actual).toEqual(expected);
        });

        test("compile should throw an error if the string passed as argument matches '[Clause] [Op]'", function() {
            let str = "isOk &&";
            let fn = () => BoolExpression.compile(str);
            expect(fn).toThrow();
        });

        test("compile should throw an error if the string passed as argument matches '[Op] [Clause]'", function() {
            let str = " && isOk";
            let fn = () => BoolExpression.compile(str);
            expect(fn).toThrow();
        });

        test("compile should throw an error if the string passed as argument matches '[literal] =='", function() {
            let str = " name ==";
            let fn = () => BoolExpression.compile(str);
            expect(fn).toThrow();
        });

        test("compile should throw an error if the string passed as argument matches '[Clause] [Clause]'", function() {
            let str = " name == Alex isOk";
            let fn = () => BoolExpression.compile(str);
            expect(fn).toThrow();
        });

        test("compile should throw an error if the string passed as argument has an operator not recognized", function() {
            let str = " name == Alex |= isOk";
            let fn = () => BoolExpression.compile(str);
            expect(fn).toThrow();
        });

        test("compile should throw an error if the string passed as argument has an comparator not recognized", function() {
            let str = " name /= Alex && isOk";
            let fn = () => BoolExpression.compile(str);
            expect(fn).toThrow();
        });

    });
    
    describe("eval", () => {

        test("eval should return true if the expression with one clause with one variable is true", function() {
            let expr = BoolExpression.compile("name");
            let ctx = {name: true};

            let actual = expr.eval(ctx);
            let expected = true;
            
            expect(actual).toBe(expected);
        });

        test("eval should return true if the expression with one clause with a comparator is true", function() {
            let expr = BoolExpression.compile("name == Alex");
            let ctx = {name: "Alex"};

            let actual = expr.eval(ctx);
            let expected = true;
            
            expect(actual).toBe(expected);
        });

        test("evaluate should return false if it's the conjunction of false expressions", function() {
            let expr = BoolExpression.compile("name == Alex && isOk && age != 20");
            let ctx = {name: "NotAlex", age: 23, isOk: false};

            let actual = expr.eval(ctx);
            let expected = false;
            
            expect(actual).toBe(expected);
        });
    });
    
});