import {CSSProperties} from "react";

interface Styles {
    button: CSSProperties;
}

const styles: Styles = {
    button: {
        width: 16,
        height: 16,
        padding: "0px",
        border: "none",
        cursor: "pointer",
        margin: "2px 2px"
    }
};

export default styles;