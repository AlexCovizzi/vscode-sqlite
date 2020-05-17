import * as React from "react";

interface Props {
    transparent?: boolean;
}


const Header: React.FunctionComponent<Props> = (props) => {
    return (
        <div style={getStyle(props.transparent)}>
            <ul style={getListStyle()}>{props.children}</ul>
        </div>
    );
};

export default Header;

function getStyle(transparent?: boolean): React.CSSProperties {
    const backgroundColor = transparent ? "transparent" : "rgba(127, 127, 127, 0.25)";
    const boxShadow = transparent ? "0 0 0 0 transparent" : "0px 1px 1px rgba(0,0,0,0.5)";
    return {
        backgroundColor: backgroundColor,
        boxShadow: boxShadow,
        padding: "4px 4px",
        position: "relative",
        zIndex: 10,
        margin: "1px 0px"
    };
}

function getListStyle(): React.CSSProperties {
    return {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        overflow: "hidden"
    };
}