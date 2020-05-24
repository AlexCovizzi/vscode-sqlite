import * as React from "react";
import styles from "./styles";

interface Props {
    transparent?: boolean;
}


const Header: React.FunctionComponent<Props> = (props) => {
    const headerStyle = props.transparent ? styles.headerTransparent : styles.header;
    return (
        <div style={headerStyle}>
            <ul style={styles.list}>{props.children}</ul>
        </div>
    );
};

export default Header;
