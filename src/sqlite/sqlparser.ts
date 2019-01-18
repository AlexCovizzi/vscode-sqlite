export namespace SQLParser {

    export function parse(query: string): string[] {
        let charArray: Array <string> = Array.from(query);
        let statements: string[] = [''];
        let prevChar: string = '';
        let nextChar: string = '';
        let isInComment: boolean = false;
        let isInString: boolean = false;
        let commentChar: string = '';
        let stringChar: string = '';
        
        for (let i = 0; i < charArray.length; i++) {
            let char = charArray[i];
            prevChar = i > 0? charArray[i-1] : "";
            nextChar = i < charArray.length? charArray[i+1] : "";
            
            if (isInString) {
                // end of string
                if (char === stringChar) {
                    isInString = false;
                    stringChar = "";
                }

                statements[statements.length-1] += char;
            } else if (isInComment) {
                // end of -- comment
                if (commentChar === '-' && char === '\n') {
                    isInComment = false;
                    commentChar = "";
                    continue;
                }
                // end of /* comment
                if (commentChar === '/' && char === '/' && prevChar === '*') {
                    isInComment = false;
                    commentChar = "";
                    continue;
                }
            } else {
                // end of statement
                if (char === ';') {
                    statements[statements.length-1] += char;
                    statements.push('');
                    continue;
                }

                // new lines are replaced with a space
                if (char === '\n') {
                    if (prevChar === '\r') {
                        // we are on windows
                        statements[statements.length-1] = statements[statements.length-1].slice(0, -1);
                    }
                    statements[statements.length-1] += ' ';
                    continue;
                }

                // start of comment
                if ( (char === '-' && nextChar === '-') || (char === '/' && nextChar === '*')) {
                    isInComment = true;
                    commentChar = char;
                    i++; // we are not interested in the next char
                    continue;
                }

                // start of string
                if (char === '"' || char === '\'') {
                    isInString = true;
                    stringChar = char;
                    statements[statements.length-1] += char;
                    continue;
                }

                statements[statements.length-1] += char;
            }
        }

        return statements
                .map(stmt => stmt.trim()) // trim spaces on the sides
                .filter(stmt => stmt !== "") // filter out empty statements
                .map(stmt => stmt.endsWith(';')? stmt : stmt += ';'); // make sure each statement ends with ';'
    }

}
