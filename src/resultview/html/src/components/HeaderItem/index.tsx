import * as React from "react";

interface Props extends React.CSSProperties {

}

const HeaderItem: React.FunctionComponent<Props> = (props) => {
    return (
        <li style={props}>
            {props.children}
        </li>
    );
};

export default HeaderItem;