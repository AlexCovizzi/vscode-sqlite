export class ResultSet extends Array<Result> {

    toJSON() {
        let resultArr: Result[] = [];
        this.forEach(result => {
            resultArr.push(result);
        });
        return JSON.stringify(resultArr, null, 2);
    }
}

export interface Result {
    id: number;
    stmt: string;
    header: string[];
    rows: Row[];
}

export interface Row extends Array<string> {
    
}