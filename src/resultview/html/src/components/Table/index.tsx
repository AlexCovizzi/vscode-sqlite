import * as React from "react";
import { merge } from "../../utils";

interface Props {
    data: {
        header: string[];
        rows: (string | number)[][];
    };
}

const Table: React.FunctionComponent<Props> = (props) => {
    return (
        <table style={getStyle()}>
            <thead>
                <tr>
                {props.data.header.map((col, i) => (
                    <th key={i} style={getHeadColStyle()}>{col}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {props.data.rows.map((row, i) => (
                    <tr key={i}>
                        {row.map((col, j) => (
                            <td key={j} style={getBodyColStyle()}>{col}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;

function getStyle(): React.CSSProperties {
    return {
        borderCollapse: "collapse",
        display: "block",
        overflowY: "hidden",
        overflowX: "auto",
        marginBottom: "4px"
    };
}

function getHeadColStyle(): React.CSSProperties {
    return merge(getColStyle(), {background: "var(--dark)"});
}

function getBodyColStyle(): React.CSSProperties {
    return merge(getColStyle(), {whiteSpace: "pre"});
}

function getColStyle(): React.CSSProperties {
    return {
        border: "1px solid var(--light)",
        padding: "5px"
    };
}