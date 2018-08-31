import { h, Component } from 'preact';
import { Statement } from '../statement';
import { Table } from '../table';
import { Pager } from '../pager';
import { ShowHide } from '../showhide';
import { Hideable } from '../hideable';
import { ExportCsv } from '../exportcsv';
import { ExportJson } from '../exportjson';
import { Header } from '../header';
import { Fetch, Response } from '../fetch';
import style from './style.css';
import { ExportHtml } from '../exporthtml';

interface Props {
    idx: number;
}

interface State {
    hidden: boolean;
    fromRow: number;
    toRow: number;
}

export class Result extends Component<Props, State> {

    constructor(props: Props, context: any) {
        super(props, context);
    }

    toggleHidden() {
        this.setState({hidden: !this.state.hidden});
    }

    changeRows(fromRow: number, toRow: number) {
        if (this.state.fromRow !== fromRow || this.state.toRow !== toRow) {
            this.setState({fromRow: fromRow, toRow: toRow});
        }
    }

    render(props: Props, state: State) {
        return (
            <Fetch resource={`pageRows`} forceUpdate={true}>
                {(response: Response) => {
                    if (response.data != null) {
                        return (
                        <div class={style.result}>
                            <Header>
                                <Statement idx={props.idx} />
                                <ShowHide right={true} onToggle={this.toggleHidden.bind(this)} />
                                <ExportCsv right={true} idx={props.idx} />
                                <ExportJson right={true} idx={props.idx} />
                                <ExportHtml right={true} idx={props.idx} />
                            </Header>
                            <Hideable hidden={state.hidden} >
                                <Table idx={props.idx} pageRows={response.data}
                                    fromRow={state.fromRow} toRow={state.toRow}
                                />
                                <Pager idx={props.idx} pageRows={response.data}
                                    onPage={this.changeRows.bind(this)}
                                />
                            </Hideable>
                        </div>
                        );
                    }
                }}
            </Fetch>
        )
    }
}