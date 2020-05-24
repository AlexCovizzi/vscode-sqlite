import {CSSProperties} from "react";

interface Styles {
    statement: CSSProperties;
    statementCollapsed: CSSProperties;
    code: CSSProperties;
}

const styles: Styles = {
    statement: {
        whiteSpace: "pre-line"
    },
    statementCollapsed: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    code: {
        cursor: "default"
    }
};

export default styles;
