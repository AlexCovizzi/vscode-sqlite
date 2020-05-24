import {CSSProperties} from "react";

interface Styles {
    header: CSSProperties;
    headerTransparent: CSSProperties;
    list: CSSProperties;
}

const styles: Styles = {
    header: {
        backgroundColor: "rgba(127, 127, 127, 0.25)",
        boxShadow: "0px 1px 1px rgba(0,0,0,0.5)",
        padding: "4px 4px",
        position: "relative",
        zIndex: 10,
        margin: "1px 0px"
    },
    headerTransparent: {
        backgroundColor: "transparent",
        padding: "4px 4px",
        position: "relative",
        zIndex: 10,
        margin: "1px 0px"
    },
    list: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        overflow: "hidden"
    },
};

export default styles;