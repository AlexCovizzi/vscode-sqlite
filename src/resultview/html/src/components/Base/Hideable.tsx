import * as React from "react";

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

const styles: { hidden: React.CSSProperties } = {
    hidden: {
        display: "none"
    }
};
