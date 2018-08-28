import { h, Component } from 'preact';
import style from './style.css';

interface Props {
    children: any[];
}

interface State {

}

export class Header extends Component<Props, State> {

    render(props: Props, state: State) {
        return (
        <div class={style.header}>
            <ul>
                {
                    props.children.map(child => 
                        <li class={child.attributes.right? style.right : style.left}>
                            {child}
                        </li>
                    )
                }
            </ul>
        </div>
        );
    }
}