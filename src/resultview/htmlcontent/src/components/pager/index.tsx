import { h, Component } from 'preact';
import { Fetch, Response } from '../fetch';
import style from './style.css';

interface Props {
    idx: number;
    pageRows: number;
    onPage: (fromRow: number, toRow: number) => any;
}

interface State {

}

export class Pager extends Component<Props, State> {

    private page: number;
    private pages: number;
    private totRows: number;


    constructor(...args: any[]) {
        super(...args);

        this.page = 1;
        this.pages = Number.MAX_SAFE_INTEGER;
        this.totRows = Number.MAX_SAFE_INTEGER;
    }

    componentDidMount() {
        this.changePage(1);
    }

    changePage(newPage: number) {
        newPage = newPage < 1? 1 : newPage;
        newPage = newPage > this.pages? this.pages : newPage;
        this.page = newPage;
        let fromRow = (this.page-1) * this.props.pageRows;
        let toRow = fromRow + this.props.pageRows - 1;
        toRow = toRow > this.totRows-1? this.totRows-1 : toRow;
        this.props.onPage(fromRow, toRow);

        let pagerInput = document.getElementById('pager-input') as HTMLInputElement;
        if (pagerInput) pagerInput.value = this.page.toString();
    }

    onKeyPress(e: any) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode === '13'){
            e.preventDefault();
            this.changePage(parseInt(e.target.value));
            return false;
        }
    }

    render(props: Props, state: State) {

        return (
            <Fetch resource={`resultSet/${props.idx}/rows/length`}>
            {
                (response: Response) => {
                    this.totRows = response.data;
                    this.pages = Math.ceil(this.totRows/this.props.pageRows);
                    return (
                        <div class={style.pager}>
                            <button onClick={() => this.changePage(this.page-1)}>
                                &#10094;
                            </button>
                            <input id="pager-input" type={"number"} min={1} max={this.pages}
                                value={this.page} onKeyPress={this.onKeyPress.bind(this)}
                            />
                            <small>{this.pages? `/${this.pages}` : "/..."}</small>
                            <button onClick={() => this.changePage(this.page+1)}>
                                &#10095;
                            </button>
                        </div>
                    );
                }
            }
            </Fetch>
        );
    }
}