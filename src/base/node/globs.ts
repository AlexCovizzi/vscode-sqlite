
export function match(glob: string, str: string, noGlobStar: boolean): boolean;
export function match(glob: string, strArr: string[], noGlobStar: boolean): string[];
export function match(glob: string, strOrArr: string|string[], noGlobStar: boolean = true): boolean|string[] {
    if (typeof strOrArr === "string") {
        //let str = strOrArr as string;
        return true;
    } else {
        //let strArr = strOrArr as string[];
        return [];
    }
}