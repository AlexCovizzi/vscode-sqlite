import { h, Component } from 'preact';
import { Fetch, Response } from '../fetch';
import style from './style.css';

interface Props {
    idx: number;
}

interface State {
    isCollapsed: boolean;
}

export class Statement extends Component<Props, State> {

    constructor(props: Props, context: any) {
        super(props, context);

        this.state = ({isCollapsed: true});
    }

    onclick() {
        const currState = this.state.isCollapsed;
        this.setState({isCollapsed: !currState});
    }

    render(props: Props, state: State) {
        return (
            <Fetch resource={`resultSet/${props.idx}/stmt`} forceUpdate={true}>
                {(response: Response) => (
                    <div class={state.isCollapsed ? style.statementCollapsed : null} onClick={() => this.onclick()}>
                        {response.loading && <code>Loading...</code>}
                        {response.error &&  <code>Error: {response.error}</code>}
                        {response.data && <code>{response.data}</code>} 
                    </div>
                )}
            </Fetch>
        );
    }
}