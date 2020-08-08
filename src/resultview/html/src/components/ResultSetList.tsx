import * as React from "react";
import ResultSet from "./ResultSet";

interface Props {
    list: Array<{
        statement: string;
        columns: string[];
        size: number;
        rows?: string[][];
    }>;
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