import { h, Component, ComponentChild, VNode } from 'preact';
import { Service } from '../../service/service';

export interface Response {
    loading: boolean;
    data?: any;
    error?: Error;
}

interface Props {
    resource: string;
    forceUpdate?: boolean;
    children?: any;
}

interface State {
    data: any;
    error: Error;
}

export class Fetch extends Component<Props, State> {

    private cache: {[resource: string]: any};

    constructor(props: Props, context: any) {
        super(props, context);
        this.cache = {};
    }

    componentWillMount() {
        this._fetch(this.props.resource);
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.resource !== nextProps.resource) {
            this._fetch(nextProps.resource);
        }
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (this.props.forceUpdate) {
            return true;
        } else {
            // no need to update if the data is the same
            return (JSON.stringify(this.state.data) !== JSON.stringify(nextState.data));
        }
    }

    _fetch(resource?: string) {
        if(!resource) return;

        
        // check if the response to the message is cached
        // and if it is return the data
        if (this.cache[resource] != null) {
            this.setState({data: this.cache[resource]});
            return;
        }
            
        let service = Service.getInstance();
        let command = `fetch:/${resource}`;
        service.request({command: command, data: {}}).then((data: any) => {
            this.cache[resource] = data;
            this.setState({data: data});
        }).catch((reason: any) => {
            this.setState({error: reason});
        });
    }

    render(props: Props, state: State) {
        if (state.data != null || state.error != null) {
            return props.children? props.children[0]({loading: false, data: state.data, error: state.error} as Response) : null;
        } else {
            return props.children? props.children[0]({loading: true} as Response) : null;
        }
    }
}