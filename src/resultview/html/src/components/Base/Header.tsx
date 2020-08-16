import * as React from "react";

interface Props {
    style?: "normal"|"transparent";
}


export const Header: React.FunctionComponent<Props> = (props) => {
    let headerStyle = styles.header;
    if (props.style === "transparent") headerStyle = styles.headerTransparent;
    return (
        <div style={headerStyle}>
            {props.children}
        </div>
    );
};

const styles: {[prop: string]: React.CSSProperties} = {
    header: {
        justifyContent: "space-between",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "rgba(127, 127, 127, 0.25)",
        boxShadow: "0px 1px 0px rgba(0,0,0,0.5)",
        padding: "2px 2px",
        zIndex: 10,
        margin: "1px 0px"
    },
    headerTransparent: {
        justifyContent: "space-between",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "transparent",
        padding: "4px 4px",
        zIndex: 10,
        margin: "1px 0px"
    }
};