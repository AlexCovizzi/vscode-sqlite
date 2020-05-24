import * as React from "react";
import styles from "./styles";

interface Props {
    data: {
        header: string[];
        rows: (string | number)[][];
    };
}

const Table: React.FunctionComponent<Props> = (props) => {
    return (
        <table style={styles.table}>
            <thead>
                <tr>
                {props.data.header.map((col, i) => (
                    <th key={i} style={styles.headCol}>{col}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {props.data.rows.map((row, i) => (
                    <tr key={i}>
                        {row.map((col, j) => (
                            <td key={j} style={styles.bodyCol}>{col}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
