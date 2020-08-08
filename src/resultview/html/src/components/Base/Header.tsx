import * as React from "react";

interface Props {
    transparent?: boolean;
}


export const Header: React.FunctionComponent<Props> = (props) => {
    const headerStyle = props.transparent ? styles.headerTransparent : styles.header;
    return (
        <div style={headerStyle}>
            <ul style={styles.list}>{props.children}</ul>
        </div>
    );
};

export const Item: React.FunctionComponent<{width?: string | number;  align?: "left" | "right"}> = (props) => {
    const style: React.CSSProperties = {
        width: props.width,
        float: props.align
    };
    return (<li style={style}>{props.children}</li>);
};

const styles: {[prop: string]: React.CSSProperties} = {
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