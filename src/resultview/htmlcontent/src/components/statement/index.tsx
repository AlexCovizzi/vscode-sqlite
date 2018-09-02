import { h, Component } from 'preact';
import { Fetch, Response } from '../fetch';
import style from './style.css';

interface Props {
    idx: number;
}

interface State {

}

export class Statement extends Component<Props, State> {

    render(props: Props, state: State) {
        return (
            <Fetch resource={`resultSet/${props.idx}/stmt`}>
                {(response: Response) => (
                    <div>
                        {response.loading && <code>Loading...</code>}
                        {response.error &&  <code>Error: {response.error}</code>}
                        {response.data && <code>{response.data}</code>} 
                    </div>
                )}
            </Fetch>
        );
    }
}