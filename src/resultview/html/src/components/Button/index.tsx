import * as React from "react";
import { merge } from '../../utils';
import styles from "./styles";

interface Props {
    title?: string;
    width?: string | number;
    height?: string | number;
    background?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: React.FunctionComponent<Props> = (props) => {
    const style = merge(styles.button, {
        width: props.width,
        height: props.height,
        background: props.background
    });
    return (
        <button style={style} title={props.title} onClick={props.onClick}>
            {props.children}
        </button>
    );
};

export default Button;
