import { normalize } from "./strings";

export enum Comparator {
    EQUAL = "EQUAL",
    NOT_EQUAL = "NOT_EQUAL"
}

export enum Operator {
    AND = "AND",
    OR = "OR"
}

interface Evaluation {
    variable: string;
}

interface Comparation {
    variable: string;
    comparator: Comparator;
    value: string;
}

interface Operation {
    operator: Operator;
    left: Expression;
    right: Expression;
}

export type Clause = Evaluation|Comparation;

export type Expression = Clause | Operation;

export namespace Expression {

    export function parse(str: string): Expression {
        let tokens = str.split(/\s+/);

        for(let token of tokens) {
            if (token == "&&") {
                expression.push(clause);
                expression.push(Operator.AND);
                clause = { variable: "" };
            } else if (token == "||") {
                expression.push(clause);
                expression.push(Operator.OR);
                clause = { variable: "" };
            } else if (token == "==") {
                clause.comparator = Comparator.EQUAL;
            } else if (token == "!=") {
                clause.comparator = Comparator.NOT_EQUAL;
            } else {
                if (clause.comparator) {
                    clause.value = token;
                } else {
                    clause.variable = token;
                }
            }
        }
        expression.push(clause);

    }

    export function evaluate(expr: Expression, context: {[variable: string]: any}): boolean {
        if ("operator" in expr) {
            let leftResult = evaluate(expr.left, context);
            let rightResult = evaluate(expr.right, context);
            switch(expr.operator) {
                case Operator.AND:
                    return leftResult && rightResult;
                case Operator.OR:
                    return leftResult || rightResult;
                default:
                    throw Error(`Operator '${expr.operator}' not supported.`);
            }
        } else {
            let varValue = context[expr.variable];
            if ("comparator" in expr) {
                switch(expr.comparator) {
                    case Comparator.EQUAL:
                        return varValue === expr.value;
                    case Comparator.NOT_EQUAL:
                        return varValue !== expr.value;
                    default:
                        throw Error(`Comparator '${expr.comparator}' not supported.`);
                }
            } else {
                return Boolean(varValue);
            }
        }
    }
}