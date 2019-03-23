export function removeCaptures(regExStr: string) {
    return regExStr.replace(/[^\\]\((?!\?\:)/g, substr => {
        return substr + "?:";
    });
}


interface Match { match: string; groups: string[]; index: number; length: number; }
export function findMatches(regex: RegExp, str: string, strOffset: number = 0, matches: Match[] = []) {
    let execArr = regex.exec(str);
    if (execArr) {
        matches.push({match: execArr[0], groups: execArr.slice(1), index: execArr.index+strOffset, length: execArr[0].length});
        let offset = execArr.index+execArr[0].length;
        findMatches(regex, str.substring(offset), strOffset+offset, matches);
    }
    return matches;
}