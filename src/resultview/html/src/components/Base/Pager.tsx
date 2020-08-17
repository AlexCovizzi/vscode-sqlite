import * as React from "react";
import { Button, Icons } from "../Base";

interface Props {
    total: number;
    offset: number;
    limit: number;
    onPage?: (offset: number, limit: number) => void;
}

interface State {
    value: string;
}

class Pager extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {value: String(this.props.offset + 1)};
    }

    render() {
        const toRowStr = String(this.props.offset + this.props.limit < this.props.total ? this.props.offset + this.props.limit : this.props.total);
        return (
            <table style={styles.pager}>
                <tbody>
                    <tr>
                        <td><Button onClick={this.handlePrevClick.bind(this)}><Icons.ArrowLeft/></Button></td>
                        <td style={{whiteSpace: "nowrap"}}>{this.renderRowInput()}<span>{` - ${toRowStr} of ${this.props.total}`}</span></td>
                        <td><Button onClick={this.handleNextClick.bind(this)}><Icons.ArrowRight/></Button></td>
                    </tr>
                </tbody>
            </table>
        );
    }

    private renderRowInput() {
        return (
            <input style={{...styles.input, width: this.props.total.toString().length + "em"}}
                type="text" value={this.state.value}
                onChange={this.handleInputChange.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
            />
        );
    }

    private handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter" || event.keyCode === 13) {
            if (Number(this.state.value) != NaN) {
                this.changePage(Number(this.state.value) - 1);
            } 
        }
    }

    private handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({value: event.target.value});
    }

    private handlePrevClick(event: React.MouseEvent) {
        event.preventDefault();
        this.changePage(this.props.offset - this.props.limit);
    }

    private handleNextClick(event: React.MouseEvent) {
        event.preventDefault();
        this.changePage(this.props.offset + this.props.limit);
    }

    private changePage(newOffset: number) {
        let offset = newOffset < this.props.total ? newOffset : this.props.offset;
        offset = offset > 0 ? offset : 0;

        if (this.props.onPage){
            this.props.onPage(offset, this.props.limit);
        }

        this.setState({value: String(offset + 1)});
    }

}

export default Pager;


const styles: {[prop: string]: React.CSSProperties} = {
    pager: {
        backgroundColor: "transparent"
    },
    input: {
        color: "var(--vscode-editor-foreground)",
        textAlign: "center",
        backgroundColor: "rgba(127, 127, 127, 0.25)",
        border: "none"
    }
};