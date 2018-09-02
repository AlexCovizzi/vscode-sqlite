import { h, Component } from 'preact';
import style from './style.css';

interface Props {
    hidden: boolean;
    children: any;
}

interface State {

}

export class Hideable extends Component<Props, State> {

    render(props: Props, state: State) {
        return (
            <div class={props.hidden? style.hidden : style.showing}>
                { props.children }
            </div>
        );
    }
}