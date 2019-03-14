export interface WhenExpr {
    expression: Expression;
    verify: (values: Object) => boolean;
}

export enum Comparator {
    EQUAL = "EQUAL",
    NOT_EQUAL = "NOT_EQUAL"
}

export enum Operator {
    AND = "AND",
    OR = "OR"
}

export interface Clause {
    variable: string;
    comparator?: Comparator;
    value?: string;
}

export type Expression = Array<Clause|Operator>;

export function createWhenExpr(str: string): WhenExpr {
    // validate
    let match = str.match(/^\s*\w+\s*(\s+(=|!)=\s+\w+\s*)?((\s+(&&|\|\|)\s+\w+\s*(\s+(=|!)=\s+\w+\s*)?))*$/);
    if (!match) throw new Error(`Invalid when string: '${str}'`);
    // filter empty strings and clean
    let tokens = str.split(/\s+/);
    tokens = tokens.filter(token => token !== "").map(token => token.trim()).map(token => token.toLowerCase());
    // parse
    let expression: Expression = [];
    let clause: Clause = { variable: "" };
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

    return {
        expression: expression,
        verify: (values: {[variable: string]: any}) => {
            let verified = false;
            let lastOperator: Operator|undefined = undefined;
            for(let token of expression) {
                if (token instanceof Object) {
                    let clause = token as Clause;
                    let clauseVerified = false;
                    let value = values[clause.variable] instanceof String? values[clause.variable].toLowerCase() : values[clause.variable];
                    if (clause.value !== undefined && clause.comparator == Comparator.EQUAL) {
                        clauseVerified = (clause.value === value);
                    } else if (clause.value !== undefined && clause.comparator === Comparator.NOT_EQUAL) {
                        clauseVerified = (clause.value !== value);
                    } else {
                        clauseVerified = Boolean(value);
                    }
                    if (lastOperator === Operator.AND) {
                        verified = verified && clauseVerified;
                    } else if (lastOperator === Operator.OR) {
                        verified = verified || clauseVerified;
                    } else {
                        // first clause
                        verified = clauseVerified;
                    }
                } else {
                    lastOperator = token as Operator;
                }
            }
            return verified;
        }
    }
}