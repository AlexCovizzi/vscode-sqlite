import * as React from "react";
import { merge } from '../../utils';

interface Props {
    title?: string;
    width?: string | number;
    height?: string | number;
    background?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: React.FunctionComponent<Props> = (props) => {
    const style = merge(styles.button, {
        width: props.width || 24,
        height: props.height || props.width,
        background: props.background
    });
    return (
        <button style={style} title={props.title} onClick={props.onClick}>
            {props.children}
        </button>
    );
};

export default Button;

const styles: {button: React.CSSProperties} = {
    button: {
        width: 24,
        height: 24,
        padding: "2px",
        border: "none",
        cursor: "pointer",
        margin: "2px 2px"
    }
};