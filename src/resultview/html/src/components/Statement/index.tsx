import * as React from "react";
import { merge } from "../../utils";

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
        return (
            <div style={this.getStyle(this.state.collapsed)} onClick={this.handleClick.bind(this)}>
                <code style={{cursor: "default"}}>{this.props.value}</code>
            </div>
        );
    }

    private handleClick(event: React.MouseEvent) {
        event.preventDefault();
        const oldCollapsed = this.state.collapsed;
        this.setState({collapsed: !oldCollapsed});
    }

    private getStyle(collapsed: boolean): React.CSSProperties {
        let style: React.CSSProperties = {
            whiteSpace: "pre-line"
        };
        if (collapsed) {
            style = merge(style, {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            });
        }
        return style;
    }
}

export default Statement;
