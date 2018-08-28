import { h, Component } from 'preact';
import { Fetch } from '../../fetch';

export class THead extends Component {

    render(props, state) {
        return (
            <thead>
                <Fetch resource={`resultSet/${props.idx}/header`}>
                    {({loading, data, error}) => (
                        <tr>
                            {loading && null}
                            {error &&  null}
                            {data && data.map(field => <th>{field}</th>) } 
                        </tr>
                    )}
                </Fetch>
            </thead>
        );
    }
}