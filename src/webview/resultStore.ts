import { ResultSet } from "../database/resultSet";
import { Constants } from "../constants/constants";
import { randomString } from "../utils/utils";

export class QueryResultStore {

    private queryResults: QueryResults;

    constructor() {
        this.queryResults = {};
    }

    put(resultSet: ResultSet): string {
        let uid = this.generateUniqueId();
        this.queryResults[uid] = resultSet;
        return uid;
    }

    get(uid: string) {
        return this.queryResults[uid];
    }

    has(uid: string) {
        return uid in this.queryResults;
    }

    // keep generating ids until you find one that is not already being used
    private generateUniqueId() {
        let length = Constants.queryResultIdLength;
        let uid = randomString(length);
        while(this.has(uid)) {
            uid = randomString(length);
        }
        return uid;
    }
}

interface QueryResults {
    [uid: string]: ResultSet;
}