import { h, Component } from 'preact';
import { Fetch, Response } from '../../fetch';
import { TRow } from '../trow';
import { range } from '../../../utils/utils';

interface Props {
    idx: number;
    pageRows: number;
    fromRow: number;
    toRow: number;
}

interface State {

}

export class TBody extends Component<Props, State> {

    render(props: Props, state: State) {
        let rowsRange = range(0, props.pageRows-1);
        let resources = range(props.fromRow, props.toRow).map(i => `resultSet/${props.idx}/rows/${i}`);

        return (
            <tbody>
                {rowsRange.map(i => {
                    if (i < resources.length) {
                        return (<Fetch resource={resources[i]} forceUpdate={true}>
                            {(response: Response) => <TRow row={response.data} n={i+props.fromRow} />}
                        </Fetch>);
                    } else {
                        return (<TRow />);
                    }
                })}
            </tbody>
        );
    }
}