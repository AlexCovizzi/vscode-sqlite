import * as React from "react";

interface Props {
    value: string;
}

interface State {
    collapsed: boolean;
}

class Statement extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {collapsed: true};
    }

    render() {
        const style = this.state.collapsed ? styles.statementCollapsed : styles.statement;
        return (
            <div style={style} onClick={this.handleClick.bind(this)}>
                <code style={styles.code}>{this.props.value}</code>
            </div>
        );
    }

    private handleClick(event: React.MouseEvent) {
        event.preventDefault();
        const oldCollapsed = this.state.collapsed;
        this.setState({collapsed: !oldCollapsed});
    }
}

export default Statement;

const styles: {[prop: string]: React.CSSProperties} = {
    statement: {
        whiteSpace: "pre-line"
    },
    statementCollapsed: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    code: {
        cursor: "default"
    }
};