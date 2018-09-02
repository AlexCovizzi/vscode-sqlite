import { h, Component } from 'preact';
import style from './style.css';

export interface Icon {
    light: string;
    dark: string;
}

interface Props {
    icon: Icon;
    title: string;
    size?: number;
    ready: boolean;
    onclick: any;
}

interface State {

}

export class IconButton extends Component<Props, State> {

    getIcon(icon: Icon) {
        let htmlIcon = 'data:image/svg+xml;base64,';
        if (document.body.className === 'vscode-light') {
            htmlIcon += window.btoa(icon.light);
        } else {
            htmlIcon += window.btoa(icon.dark);
        }
        return htmlIcon;
    }

    render(props: Props, state: State) {
        if (props.ready) {
            return (
                <input class={style.btn} type="image" title={props.title}
                    alt={props.title} src={this.getIcon(props.icon)} 
                    width={props.size || 16} height={props.size || 16}
                    onClick={props.onclick}
                />
            );
        } else {
            return (
                <div class={style.loader}></div>
            );
        }
    }
}