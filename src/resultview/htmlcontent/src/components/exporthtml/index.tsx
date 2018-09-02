import { h, Component } from 'preact';
import { IconButton} from '../iconbutton';
import { Fetch, Response } from '../fetch';
import { Service } from '../../service/service';

interface Props {
    idx?: number;
    right: boolean;
}

interface State {

}

export class ExportHtml extends Component<Props, State> {
    icon = {
        dark: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 16 16"><g transform="matrix(4.1791045,0,0,4.3076924,-0.04477611,-0.07692331)"><path d="M 1.3627119,2.0050847 1,2.4 1.6,3.1 1.4,3.5 0.4,2.4 0.76440678,2.0033898 Z M 2.6,1.3 3.6,2.4 2.6,3.5 2.4,3.1 3,2.4 2.4,1.7 Z" style="fill:#c5c5c5;fill-opacity:1" /><path d="M 2,1 1.25,1.75 h -0.5 l 0.5,-0.5 h -1 V 0.75000004 h 1 l -0.5,-0.5 h 0.5 z" style="fill:#75beff;fill-opacity:1;" /></g></svg>`,
        light: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 16 16"> <g transform="matrix(4.1791045,0,0,4.3076924,-0.04477611,-0.07692331)"> <path d="M 1.3627119,2.0050847 1,2.4 1.6,3.1 1.4,3.5 0.4,2.4 0.76440678,2.0033898 Z M 2.6,1.3 3.6,2.4 2.6,3.5 2.4,3.1 3,2.4 2.4,1.7 Z" style="fill:#424242;fill-opacity:1" /> <path d="M 2,1 1.25,1.75 h -0.5 l 0.5,-0.5 h -1 V 0.75000004 h 1 l -0.5,-0.5 h 0.5 z" style="fill:#00539c;fill-opacity:1;" /> </g> </svg> `
    };

    exportHtml() {
        let service = Service.getInstance();
        service.request({command: this.props.idx != null? `html:resultSet/${this.props.idx}` : `html:resultSet`});
    }

    render(props: Props, state: State) {
        return (
            <Fetch resource={this.props.idx != null? `resultSet/${props.idx}/rows/length` : `resultSet/length`}>
            {
                (response: Response) => (
                    <IconButton title={`Export HTML`} icon={this.icon} ready={!response.loading} onclick={this.exportHtml.bind(this)}/>
                )
            }
            </Fetch>
        );
    }
}