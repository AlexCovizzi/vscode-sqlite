import { h, Component } from 'preact';
import { Fetch } from '../../fetch';
import { TRow } from '../trow';
import { range } from '../../../utils/utils';

export class TBody extends Component {

    render(props, state) {
        let rowsRange = range(0, props.pageRows)
        let resources = range(props.fromRow, props.toRow).map(i => `resultSet/${props.idx}/rows/${i}`);

        return (
            <tbody>
                {rowsRange.map(i => {
                    if (i < resources.length) {
                        return (<Fetch resource={resources[i]}>
                            {({loading, data, error}) => <TRow row={data} />}
                        </Fetch>);
                    } else {
                        return (<TRow />)
                    }
                })}
            </tbody>
        );
    }
}