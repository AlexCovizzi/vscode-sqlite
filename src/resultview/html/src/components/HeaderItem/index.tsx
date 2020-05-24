import * as React from "react";

interface Props {
    width?: string | number;
    align?: "left" | "right";
}

const HeaderItem: React.FunctionComponent<Props> = (props) => {
    const style: React.CSSProperties = {
        width: props.width,
        float: props.align
    };
    return (
        <li style={style}>
            {props.children}
        </li>
    );
};

export default HeaderItem;