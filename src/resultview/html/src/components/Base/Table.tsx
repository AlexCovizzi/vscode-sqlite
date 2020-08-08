import * as React from "react";

interface Props {
    columns: string[];
    rows: (string | number)[][];
}

const Table: React.FunctionComponent<Props> = (props) => {
    return (
        <table style={styles.table}>
            <thead>
                <tr>
                {props.columns.map((col, i) => (
                    <th key={i} style={styles.headCol}>{col}</th>
                ))}
                </tr>
            </thead>
            {
                <tbody>
                    {props.rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((col, j) => (
                                <td key={j} style={styles.bodyCol}>{col}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            }
        </table>
    );
};

export default Table;

const styles: {[prop: string]: React.CSSProperties} = {
    table: {
        borderCollapse: "collapse",
        display: "block",
        overflowY: "hidden",
        overflowX: "auto",
        marginBottom: "4px"
    },
    headCol: {
        border: "1px solid var(--light)",
        padding: "5px",
        background: "var(--dark)"
    },
    bodyCol: {
        border: "1px solid var(--light)",
        padding: "5px",
        whiteSpace: "pre"
    }
};