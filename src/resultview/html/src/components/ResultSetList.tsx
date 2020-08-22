import * as React from "react";
import ResultSet from "./ResultSet";
import { ResultSetData } from "../api";

interface Props {
    list: Array<ResultSetData>;
    onExport: (format: string, result: number) => void;
    onRows: (offset: number, limit: number, result: number) => void;
}

const ResultSetList: React.FunctionComponent<Props> = (props) => {
    return (
        <div>
            {props.list.map((item, index) => (
                <ResultSet
                    key={index} {...item}
                    onExport={(format) => props.onExport(format, index)}
                    onRows={(offset, limit) => props.onRows(offset, limit, index)}
                />
            ))}
        </div>
    );
};

export default ResultSetList;