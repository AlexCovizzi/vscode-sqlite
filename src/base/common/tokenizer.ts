import { findMatches } from "./regex";

export interface TokenizationRule {
    id: string;
    regex: RegExp;
    replace?: (id: string, regex: RegExp, match: string, groups: string[]) => any;
}

export interface Token {
    id: string;
    text: string;
    value: any;
    start: number;
    end: number;
    isA: (id: string) => boolean;
}

export const NullToken: Token = {
    id: "__null__",
    text: "", value: "",
    start: -1, end: -1,
    isA: (id) => { return id === "__null__"; }
};

export function tokenize(str: string, tokenizationRules: TokenizationRule[]): Token[] {
    let tokens: Token[] = [];
    for(let rule of tokenizationRules) {
        let matches = findMatches(rule.regex, str);
        let ruleTokens = matches.map(match => {
            let token: Token = {
                id: rule.id,
                text: match.match,
                value: rule.replace? rule.replace(rule.id, rule.regex, match.match, match.groups) : match.match,
                start: match.index,
                end: match.index + match.length,
                isA: (id: string) => { return id === rule.id; }
            };
            return token;
        });
        tokens.push(...ruleTokens);
    }

    tokens = tokens.sort((tknA, tknB) => tknA.start<tknB.start? -1 : 1);

    return tokens;
}
