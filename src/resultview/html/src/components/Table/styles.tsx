import {CSSProperties} from "react";

interface Styles {
    table: CSSProperties;
    headCol: CSSProperties;
    bodyCol: CSSProperties;
}

const styles: Styles = {
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

export default styles;
