import { h, Component } from 'preact';
import { Pager } from '../pager';
import { TBody } from './tbody';
import { THead } from './thead';
import style from './style.css';

interface Props {
    idx: number;
    pageRows: number;
    fromRow: number;
    toRow: number;
}

interface State {

}

export class Table extends Component<Props, State> {

    render(props: Props, state: State) {
        return (
            <table class={style.table}>
                <THead idx={props.idx} />
                <TBody idx={props.idx} pageRows={props.pageRows}
                    fromRow={props.fromRow} toRow={props.toRow}
                />
            </table>
        );
    }
}