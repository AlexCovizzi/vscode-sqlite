import * as logicalExpr from "../../../../src/base/common/logicalExpr";

describe("logicalExpr.ts", () => {

    test("eval should return true if the expression with one clause with one variable is true", function() {
        let expr: logicalExpr.Expression = {
            variable: "name"
        };
        let assign = {name: true};

        let actual = logicalExpr.evalExpr(expr, assign);
        
        expect(actual).toBeTruthy();
    });

    test("eval should return true if the expression with one clause with a comparator is true", function() {
        let expr: logicalExpr.Expression = {
            variable: "name",
            comparator: logicalExpr.Comparator.EQUAL,
            value: "Alex"
        };
        let assign = {name: "Alex"};

        let actual = logicalExpr.evalExpr(expr, assign);
        
        expect(actual).toBeTruthy();
    });

    test("eval should return false if it's the conjunction of false expressions", function() {
        let expr: logicalExpr.Expression = {
            operator: logicalExpr.Operator.AND,
            expr1: {
                variable: "name",
                comparator: logicalExpr.Comparator.EQUAL,
                value: "Alex"
            },
            expr2: {
                operator: logicalExpr.Operator.AND,
                expr1: { variable: "lastname" },
                expr2: {
                    variable: "age",
                    comparator: logicalExpr.Comparator.NOT_EQUAL,
                    value: "20"
                }
            }
        };
        let assign = {name: "Alex", age: 23, lastname: true};

        let actual = logicalExpr.evalExpr(expr, assign);
        
        expect(actual).toBeTruthy();
    });
});