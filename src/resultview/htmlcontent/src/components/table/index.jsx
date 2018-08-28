import { h, Component } from 'preact';
import { Pager } from '../pager';
import { TBody } from './tbody';
import { THead } from './thead';
import style from './style';

export class Table extends Component {

    render(props, state) {
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