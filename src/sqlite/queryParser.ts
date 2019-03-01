import { Statement, StatementType } from "./statement";

export function extractStatements(query: string): Statement[] {
    let statements: Statement[] = [];

    let statement: Statement|undefined;
    let isStmt = false;
    let isString = false;
    let isComment = false;
    let isCommand = false;
    let commentChar = '';
    let stringChar = '';

    let queryLines = query.split(/\r?\n/);
    for(let lineIndex=0; lineIndex<queryLines.length; lineIndex++) {
        let line = queryLines[lineIndex];
        for(let charIndex=0; charIndex<line.length; charIndex++) {
            let char = line[charIndex];
            let prevChar = charIndex>0? line[charIndex-1] : undefined;
            let nextChar = charIndex<line.length-1? line[charIndex+1] : undefined;

            if (isStmt) {
                if (statement) statement.value += char;

                if (!isString && char === ';') {
                    isStmt = false;
                    if (statement) {
                        statement.position.end = [lineIndex, charIndex];
                        statements.push(statement);
                        statement = undefined;
                    }
                } else if (!isString && char === '\'') {
                    isString = true;
                    stringChar = '\'';
                } else if (!isString && char === '"') {
                    isString = true;
                    stringChar = '"';
                } else if (isString && char === stringChar && prevChar !== stringChar) {
                    isString = false;
                    stringChar = '';
                }
            } else if (isComment && commentChar === '-') {
                // skip char
            } else if (isComment && commentChar === '/') {
                if (char === '/' && prevChar === '*') {
                    isComment = false;
                    commentChar = '';
                }
            } else if (isCommand) {
                if (statement) statement.value += char;
            } else if (char === ' ' || char === '\t') {
                // skip this char
            } else if (char === '-' && nextChar === '-') {
                isComment = true;
                commentChar = '-';
            } else if (char === '/' && nextChar === '*') {
                isComment = true;
                commentChar = '/';
            } else if (char === '.') {
                isCommand = true;
                statement = {value: char, position: {start: [lineIndex, charIndex], end: [lineIndex, charIndex]}, type: StatementType.COMMAND};
            } else if (char.match(/\w/)) {
                isStmt = true;
                statement = {value: char, position: {start: [lineIndex, charIndex], end: [lineIndex, charIndex]}, type: StatementType.OTHER};
            } else {
                throw Error("Not a valid query");
            }
        }

        if (isCommand) {
            isCommand = false;
            if (statement) {
                statement.position.end = [lineIndex, line.length-1];
                statements.push(statement);
                statement = undefined;
            }
        }
        if (isComment && commentChar === '-') {
            isComment = false;
            commentChar = '';
        }
        if (isStmt) {
            if (statement) statement.value += "\n";
        }
    }

    statements = statements.map(statement => {
        let val = statement.value.toLowerCase();
        if (val.startsWith(StatementType.SELECT.toLowerCase())) {
            statement.type = StatementType.SELECT;
        } else if (val.startsWith(StatementType.INSERT.toLowerCase())) {
            statement.type = StatementType.INSERT;
        } else if (val.startsWith(StatementType.UPDATE.toLowerCase())) {
            statement.type = StatementType.UPDATE;
        } else if (val.startsWith(StatementType.EXPLAIN.toLowerCase())) {
            statement.type = StatementType.EXPLAIN;
        } else if (val.startsWith(StatementType.PRAGMA.toLowerCase())) {
            statement.type = StatementType.PRAGMA;
        } else if (val.startsWith('.')) {
            statement.type = StatementType.COMMAND;
        } else {
            statement.type = StatementType.OTHER;
        }
        return statement;
    });

    return statements;
}