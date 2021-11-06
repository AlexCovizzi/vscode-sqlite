export { Schema } from '../sqlite/schema';

export type ResultSet = Array<Result>;

export interface Result {
    stmt: string;
    header: string[];
    rows: string[][];
}