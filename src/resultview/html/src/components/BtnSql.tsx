import * as React from "react";
import { Button } from './Base';

interface Props {
    onClick?: () => void;
}


const BtnSql: React.FunctionComponent<Props> = (props) => {
    return (
        <Button title="Show SQL" onClick={props.onClick} width={44} height={24}>
            <div style={styles.text}>SQL&nbsp;<small style={{fontWeight: "normal"}}>&#9660;</small></div>
        </Button>
    );
};

const styles: {[prop: string]: React.CSSProperties} = {
    text: {
        fontWeight: "bold",
        color: "var(--vscode-editor-foreground)",
        textShadow: "2px 0 0 var(--vscode-editor-lineHighlightBorder)," +
            "-2px 0 0 var(--vscode-editor-lineHighlightBorder)," +
            "0 2px 0 var(--vscode-editor-lineHighlightBorder)," +
            "0 -2px 0 var(--vscode-editor-lineHighlightBorder)," +
            "1px 1px var(--vscode-editor-lineHighlightBorder)," +
            "-1px -1px 0 var(--vscode-editor-lineHighlightBorder)," +
            "1px -1px 0 var(--vscode-editor-lineHighlightBorder)," +
            "-1px 1px 0 var(--vscode-editor-lineHighlightBorder)"
    }
};

export default BtnSql;