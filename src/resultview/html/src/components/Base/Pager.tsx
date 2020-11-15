import * as React from "react";
import { Button, Icons } from "../Base";

interface Props {
    total: number; // total number of records
    offset: number; // current offset
    limit: number; // limit per page
    onPage?: (offset: number, limit: number) => void;
}

class Pager extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        const currentPage = this.getCurrentPage();
        const totalPages = this.getTotalPages();
        const rowStart = this.padLeft(String(this.props.offset + 1), String(this.props.total).length);
        const rowEndNumber = this.props.offset + this.props.limit < this.props.total ? this.props.offset + this.props.limit : this.props.total;
        const rowEnd = this.padLeft(String(rowEndNumber), String(this.props.total).length);

        return (
            <table style={styles.pager}>
                <tbody>
                    <tr>
                        <td><Button onClick={(event) => this.handlePrevClick(event, currentPage)}><Icons.ArrowLeft/></Button></td>
                        <td style={{whiteSpace: "nowrap"}}>{this.renderPageInput(currentPage, totalPages)} <span>{` / ${totalPages}`}</span></td>
                        <td><Button onClick={(event) => this.handleNextClick(event, currentPage)}><Icons.ArrowRight/></Button></td>
                        <td style={{whiteSpace: "nowrap"}}>&nbsp;{`${rowStart} - ${rowEnd} of `}<b>{this.props.total}</b></td>
                    </tr>
                </tbody>
            </table>
        );
    }

    private renderPageInput(currentPage: number, totalPages: number) {
        return (
            <input style={{...styles.input, width: (totalPages.toString().length + 1) + "em"}}
                type="number" min={1} max={totalPages} value={currentPage}
                onChange={this.handleInputChange.bind(this)}
            />
        );
    }

    private handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.changePage(Number(event.target.value));
    }

    private handlePrevClick(event: React.MouseEvent, currentPage: number) {
        event.preventDefault();
        this.changePage(currentPage - 1);
    }

    private handleNextClick(event: React.MouseEvent, currentPage: number) {
        event.preventDefault();
        this.changePage(currentPage + 1);
    }

    private changePage(newPage: number) {
        let newOffset = (newPage - 1) * this.props.limit;
        newOffset = Math.min(newOffset, (this.getTotalPages() - 1) * this.props.limit);
        newOffset = Math.max(newOffset, 0);

        if (this.props.onPage){
            this.props.onPage(newOffset, this.props.limit);
        }
    }

    private getCurrentPage() {
        return Math.floor(this.props.offset / this.props.limit) + 1;
    }

    private getTotalPages() {
        return Math.max(1, Math.ceil(this.props.total / this.props.limit));
    }

    private padLeft(str: string, until: number, char: string = ' ') {
        while(str.length < until) {
            str = char + str;
        }
        return str;
    }

}

export default Pager;


const styles: {[prop: string]: React.CSSProperties} = {
    pager: {
        backgroundColor: "transparent",
        fontFamily: "var(--vscode-editor-font-family)",
        fontSize: "var(--vscode-editor-font-size)"
    },
    input: {
        color: "var(--vscode-editor-foreground)",
        fontFamily: "var(--vscode-editor-font-family)",
        fontSize: "var(--vscode-editor-font-size)",
        textAlign: "center",
        backgroundColor: "rgba(127, 127, 127, 0.25)",
        border: "none"
    }
};