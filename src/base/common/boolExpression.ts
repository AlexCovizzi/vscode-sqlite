import { tokenize, NullToken, Token } from "./tokenizer";

export enum Comparator {
    EQUAL = "==",
    NOT_EQUAL = "!="
}

export enum Operator {
    AND = "&&",
    OR = "||"
}

type ExprContext = {[variable: string]: any};

interface Evaluable {
    eval: (context: ExprContext) => boolean;
}

interface Evaluation extends Evaluable {
    variable: string;
}

interface Comparation extends Evaluable {
    variable: string;
    comparator: Comparator;
    value: any;
}

interface Operation extends Evaluable {
    operator: Operator;
    left: BoolExpression;
    right: BoolExpression;
}

export type Clause = Evaluation|Comparation;

export type BoolExpression = Clause|Operation; 

enum ExprToken {
    OPERATOR = "operator",
    LITERAL = "literal",
    COMPARATOR = "comparator"
}

export namespace BoolExpression {
    
    export function compile(str: string): BoolExpression {
        let rules = [
            {id: ExprToken.OPERATOR, regex: /(\&\&|\|\|)/},
            {id: ExprToken.COMPARATOR, regex: /(==|!=)/},
            {id: ExprToken.LITERAL, regex: /\w+/},
        ];
        let tokens = tokenize(str, rules);
        let exprParts = _convertTokensToExpressionParts(tokens);
        let expr = _buildExpressionFromExpressionParts(exprParts);

        return expr;
    }

    function _convertTokensToExpressionParts(tokens: Token[]): Array<Clause|Operator> {
        let parts: Array<Clause|Operator> = [];

        for(let i=0; i<tokens.length; i++) {
            let token = tokens[i];
            let nextToken = tokens[i+1] || NullToken;
            let nextNextToken = tokens[i+2] || NullToken;

            if (token.isA(ExprToken.LITERAL) && nextToken.isA(ExprToken.COMPARATOR)) {
                // the token after next token has to be lit
                if (!nextNextToken.isA(ExprToken.LITERAL)) throw Error(`Error near '${token.text}'`);
                let clause = new ComparationImpl(token.value, nextToken.value, nextNextToken.value);
                parts.push(clause);
                i+=2; // skip 2
                continue;
            }
            if (token.isA(ExprToken.LITERAL) && !nextToken.isA(ExprToken.COMPARATOR)) {
                // next token has to be an operator or nothing
                if (!nextToken.isA(ExprToken.OPERATOR) && !nextToken.isA(NullToken.id)) throw Error(`Error near '${token.text}'`);
                let clause = new EvaluationImpl(token.value);
                parts.push(clause);
                continue;
            }
            if (token.isA(ExprToken.OPERATOR)) {
                // next token has to be lit
                if (!nextToken.isA(ExprToken.LITERAL)) throw Error(`Error near '${token.text}'`);
                parts.push(token.value);
                continue;
            }
            throw Error(`Error near '${token.text}'`);
        }

        return parts;
    }

    function _buildExpressionFromExpressionParts(parts: Array<Clause|Operator>): BoolExpression {
        let part = parts[0];
        let next = parts[1];
        if (typeof part === "string") {
            throw Error(`Expected a clause but got an operator: '${part}'`);
        } else {
            if (typeof next === "string") {
                let right = _buildExpressionFromExpressionParts(parts.slice(2));
                return new OperationImpl(next, part, right);
            }
            if (next === undefined) {
                return part;
            }
            throw Error(`Expected an operator or nothing but got a clause: '${JSON.stringify(part)}'`);
        }
    }

}

class EvaluationImpl implements Evaluation {
    constructor(public variable: string) { }

    eval(context: ExprContext) {
        let varValue = context[this.variable];
        return Boolean(varValue);
    }
}

class ComparationImpl implements Comparation {
    constructor(public variable: string, public comparator: Comparator, public value: any) { }

    eval(context: ExprContext) {
        let varValue = context[this.variable];
        switch(this.comparator) {
            case Comparator.EQUAL:
                return varValue === this.value;
            case Comparator.NOT_EQUAL:
                return varValue !== this.value;
            default:
                throw Error(`Comparator '${this.comparator}' not supported.`);
        }
    }
}

class OperationImpl implements Operation {
    constructor(public operator: Operator, public left: BoolExpression, public right: BoolExpression) { }

    eval(context: ExprContext) {
        let leftResult = this.left.eval(context);
        let rightResult = this.right.eval(context);
        switch(this.operator) {
            case Operator.AND:
                return leftResult && rightResult;
            case Operator.OR:
                return leftResult || rightResult;
            default:
                throw Error(`Operator '${this.operator}' not supported.`);
        }
    }
}