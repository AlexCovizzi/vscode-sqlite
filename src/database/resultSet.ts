import * as csvStringify from 'csv-stringify/lib/sync';

export class ResultSet extends Array<Result> {

    toJson(result_id?: number): string {
        if (result_id !== undefined) {
            let result = this.find(res => res.id === result_id) || {};
            return JSON.stringify(result, null, 2);
        } else {
            let resultArr: Result[] = [];
            this.forEach(result => {
                resultArr.push(result);
            });
            return JSON.stringify(resultArr, null, 2);
        }
    }

    toCsv(result_id: number): string {
        let header: string[] = [];
        let rows: string[][] = [];
        let result = this.find(res => res.id === result_id);
        if (result) {
            header = result.header;
            rows = result.rows;
        }
        let options = { columns: header, header: true };
        let csv = csvStringify(rows, options);
        return csv;
    }
}

export interface Result {
    id: number;
    stmt: string;
    header: string[];
    rows: string[][];
}