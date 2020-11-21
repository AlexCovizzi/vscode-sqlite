import * as React from "react";

interface Props {
    value: string;
}

const Statement: React.FunctionComponent<Props> = (props) => {
    return (
        <div style={styles.statement}>
            <code style={styles.code}>{props.value}</code>
        </div>
    );
};

export default Statement;

const styles: {[prop: string]: React.CSSProperties} = {
    statement: {
        width: "100%",
        borderRadius: "2px",
        margin: "2px",
        padding: "2px",
        backgroundColor: "rgba(127, 127, 127, 0.25)",
        whiteSpace: "pre-line"
    },
    code: {
        color: "var(--vscode-editor-foreground)",
        fontFamily: "var(--vscode-editor-font-family)",
        fontSize: "var(--vscode-editor-font-size)",
        cursor: "auto"
    }
};