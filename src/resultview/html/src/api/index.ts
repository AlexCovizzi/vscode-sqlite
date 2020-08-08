import VsCodeApi from "./vscodeapi";

export interface ResultSetData {
    id: number;
    statement: string;
    columns: string[];
    size: number;
}

export interface RowsData {
    result: number;
    range: [number, number];
    rows: string[][];
}

export class Api {
    private vscodeApi: VsCodeApi;

    constructor(vscodeApi?: VsCodeApi) {
        this.vscodeApi = vscodeApi? vscodeApi : VsCodeApi.acquire();
    }

    fetchResults() {
        this.vscodeApi.postMessage({type: "FETCH_RESULTS"});
    }
    
    fetchRows(result: number, offset: number, limit: number) {
        this.vscodeApi.postMessage({type: "FETCH_ROWS", payload: {result, offset, limit}});
    }

    exportResults(format: string, result?: number) {
        this.vscodeApi.postMessage({type: "EXPORT_RESULTS", payload: {result, format}});
    }

    onResults(callback: (results: ResultSetData[]) => void) {
        this.vscodeApi.onMessage((message) => {
            if (message.type === "FETCH_RESULTS") {
                callback(message.payload);
            }
        });
    }

    onRows(callback: (rows: RowsData) => void) {
        this.vscodeApi.onMessage((message) => {
            if (message.type === "FETCH_ROWS") {
                callback(message.payload);
            }
        });
    }
}