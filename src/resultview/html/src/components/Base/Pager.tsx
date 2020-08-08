import * as React from "react";
import { Button, Icons } from "../Base";

interface Props {
    total: number;
    start: number;
    onPage?: (page: number) => void;
}

interface State {
    input: string;
    current: number;
}

class Pager extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {input: props.start.toString(), current: props.start};
    }

    render() {
        return (
            <div style={styles.pager}>
                <Button background="transparent" onClick={this.handlePrevClick.bind(this)}><Icons.ArrowLeft/></Button>
                <input type="number" min={1} max={this.props.total}
                    value={this.state.input} onKeyPress={this.handleKeyPress.bind(this)} onChange={this.handleChangeInput.bind(this)}
                />
                <small>{`/${this.props.total}`}</small>
                <Button background="transparent" onClick={this.handleNextClick.bind(this)}><Icons.ArrowRight/></Button>
            </div>
        );
    }

    private handleChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        this.setState({input: event.target.value});
    }

    private handlePrevClick(event: React.MouseEvent) {
        event.preventDefault();
        this.changePage(this.state.current - 1);
    }

    private handleNextClick(event: React.MouseEvent) {
        event.preventDefault();
        this.changePage(this.state.current + 1);
    }

    private handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        let keyCode = event.keyCode || event.which;
        if (keyCode === 13){
            event.preventDefault();
            this.changePage(parseInt(event.currentTarget.value));
        }
    }

    private changePage(newPage: number) {
        if (newPage < 1) newPage = 1;
        if (newPage > this.props.total) newPage = this.props.total;
        if (newPage === this.state.current) return;

        this.setState({current: newPage, input: newPage.toString()});

        if (this.props.onPage){
            this.props.onPage(newPage);
        }
    }

}

export default Pager;


const styles: {[prop: string]: React.CSSProperties} = {
    
};