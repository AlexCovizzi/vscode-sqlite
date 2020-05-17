import * as React from "react";
import { merge } from '../../utils';

interface Props {
    style?: React.CSSProperties;
    title?: string;
    width?: string | number;
    height?: string | number;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: React.FunctionComponent<Props> = (props) => {
    const style = merge(getStyle(props.width, props.height), props.style);
    return (
        <button style={style} title={props.title} onClick={props.onClick}>
            {props.children}
        </button>
    );
};

export default Button;

function getStyle(width?: string | number, height?: string | number): React.CSSProperties {
    width = width || 16;
    height = height || width;
    return {
        width: width,
        height: height,
        padding: "0px",
        border: "none",
        cursor: "pointer",
        margin: "2px 2px"
    };
}
