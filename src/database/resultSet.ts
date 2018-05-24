export class ResultSet extends Array<Result> {

    toJSON() {
        return JSON.stringify(this);
    }
}

export interface Result {
    header: string[];
    rows: Row[];
}

export interface Row {
    [x: string]: string;
}