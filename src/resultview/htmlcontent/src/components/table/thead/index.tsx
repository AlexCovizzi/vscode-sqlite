import { h, Component } from 'preact';
import { Fetch, Response } from '../../fetch';

interface Props {
    idx: number;
}

interface State {

}

export class THead extends Component<Props, State> {

    render(props: Props, state: State) {
        return (
            <thead>
                <Fetch resource={`resultSet/${props.idx}/header`}>
                    {(response: Response) => (
                        <tr>
                            {response.loading && null}
                            {response.error && null}
                            {response.data && response.data.map((field: any, index: number) => {
                                let a = [];
                                if (index===0) a.push(<th>#</th>);
                                a.push(<th>{field}</th>);
                                return a;
                             })
                            }
                        </tr>
                    )}
                </Fetch>
            </thead>
        );
    }
}