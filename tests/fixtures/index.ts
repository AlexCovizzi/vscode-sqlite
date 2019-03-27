import { join, basename } from "path";
import { randomString } from "../helpers/utils";

export namespace Fixture {
    export const DATABASE_MAIN = "main";
    export const DATABASE_EMPTY = "empty";

    export interface Database {
        name: string;
        path: string;
        tables: {
            name: string;
            columns: {
                name: string;
                type: string;
                notnull: boolean;
                pk: number
            }[]
            records: string[][]
        }[];
    }

    export function getDatabase(name: string): Database {
        name = name.endsWith(".json")? name : name+".json";
        let obj = require(join(__dirname, "database", name));
        let fixture = JSON.parse(JSON.stringify(obj));
        if (!fixture.name) {
            if (fixture.path) fixture.name = basename(fixture.path);
            else fixture.name = randomString(6) + ".db";
        }
        if (!fixture.path) {
            fixture.path = join(__dirname, fixture.name);
        }
        return fixture;
    }
}