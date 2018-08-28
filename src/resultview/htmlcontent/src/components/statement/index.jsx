import { h, Component } from 'preact';
import { Fetch } from '../fetch';
import style from './style';

export class Statement extends Component {

    render(props, state) {
        return (
            <Fetch resource={`resultSet/${props.idx}/stmt`}>
                {({loading, data, error}) => (
                    <div>
                        {loading && <code>Loading...</code>}
                        {error &&  <code>Error: {error}</code>}
                        {data && <code>{data}</code>} 
                    </div>
                )}
            </Fetch>
        );
    }
}