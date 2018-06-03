/**
 * Adapted from https://github.com/TeamSQL/SQL-Statement-Parser by TeamSQL
 * - support for postgre, mssql, mysql removed
 * - comments are removed from the statements
 */

export class SQLParser {

    static parse(query : string) : Array <string> {
        var queries: Array <string> = [];
        var flag = true;
        var restOfQuery: any = null;

        while (flag) {
            if (restOfQuery === null) {
                restOfQuery = query;
            }
            var statementAndRest = this.getStatements(restOfQuery, ';');

            var statement = statementAndRest[0];
            if (statement !== null && statement.trim() !== "") {
                // dont add  statements that dont start with a letter
                if (statement.charAt(0).toLowerCase().match(/[a-z]/i)) {
                    queries.push(statement);
                }
            }

            restOfQuery = statementAndRest[1];
            if (restOfQuery === null || restOfQuery.trim() === "") {
                break;
            }
        }

        return queries;
    }

    private static getStatements(query : string, delimiter : string) : Array <string | null> {
        var charArray: Array <string> = Array.from(query);
        var previousChar: string | null = null;
        var nextChar: string | null = null;
        var isInComment: boolean = false;
        var commentChar: string | null = null;
        var isInString: boolean = false;
        var stringChar: string | null = null;
        var isInTag: boolean = false;
        var initIndex: number | null = null; // start of query

        var resultQueries: Array <string | null> = [];
        for (var index = 0; index < charArray.length; index++) {

            var char = charArray[index];
            if (index > 0) {
                previousChar = charArray[index - 1];
            }

            if (index < charArray.length) {
                nextChar = charArray[index + 1];
            }

            // it's in string, go to next char
            if (previousChar !== '\\' && (char === '\'' || char === '"') && isInString === false && isInComment === false) {
                isInString = true;
                stringChar = char;
                continue;
            }

            // it's comment, go to next char
            if (((char === '#' && nextChar === ' ') || (char === '-' && nextChar === '-') || (char === '/' && nextChar === '*')) && isInString === false) {
                isInComment = true;
                commentChar = char;
                continue;
            }
            // it's end of comment, go to next
            if (isInComment === true && (((commentChar === '#' || commentChar === '-') && char === '\n') || (commentChar === '/' && (char === '*' && nextChar === '/')))) {
                // next char is end of */ comment, so i'll go past it
                if (commentChar === '/' && (char === '*' && nextChar === '/')) {
                    index++;
                }
                isInComment = false;
                commentChar = null;
                initIndex = index+1;
                continue;
            }

            // string closed, go to next char
            if (previousChar !== '\\' && char === stringChar && isInString === true) {
                isInString = false;
                stringChar = null;
                continue;
            }

            // it's a query, continue until you get delimiter hit
            if (char.toLowerCase() === delimiter.toLowerCase() && isInString === false && isInComment === false && isInTag === false) {
                var splittingIndex = index;
                // if (delimiter == ";") {     splittingIndex = index + 1 }
                resultQueries = this.getQueryParts(query, initIndex? initIndex : 0, splittingIndex, delimiter);
                break;

            }

        }
        
        if (resultQueries.length === 0) {
            if (query !== null) {
                query = query.trim();
            }
            resultQueries.push(query, null);
        }

        return resultQueries;
    }

    private static getQueryParts(query : string, initIndex: number, splittingIndex : number, delimiter : string) : Array < string > {
        var statement: string = query.substring(initIndex, splittingIndex);
        var restOfQuery: string = query.substring(splittingIndex + delimiter.length);
        var result: Array <string> = [];
        if (statement !== null) {
            statement = statement.trim();
        }
        
        result.push(statement);
        result.push(restOfQuery);
        return result;
    }

}
