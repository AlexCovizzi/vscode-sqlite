import * as React from "react";
import styles from "./styles";

interface Props {
    hidden?: boolean;
}

const Hideable: React.FunctionComponent<Props> = (props) => {
    const style = props.hidden ? styles.hidden : undefined;
    return (
        <div style={style}>{props.children}</div>
    );
};

export default Hideable;
