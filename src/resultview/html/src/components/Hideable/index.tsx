import * as React from "react";

interface Props {
    hidden?: boolean;
}

const Hideable: React.FunctionComponent<Props> = (props) => {
    return (
        <div style={getStyle(props.hidden)}>{props.children}</div>
    );
};

export default Hideable;

function getStyle(hidden?: boolean): React.CSSProperties {
    return {
        display: hidden ? "none": ""
    };
}
