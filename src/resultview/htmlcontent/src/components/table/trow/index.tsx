import { h, Component } from 'preact';
import { sanitizeStringForHtml } from '../../../utils/utils';

interface Props {
    row?: string[];
    n?: number;
}

interface State {

}

export class TRow extends Component<Props, State> {

    // this component is built manually to perform some optimizations
    shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any) {
        if (!this.base || !this.base.children) return true;
        
        if (nextProps.row && nextProps.n != null) {
            this.base.setAttribute('style', 'visibility: visible;');

            while (this.base.children.length < nextProps.row.length + 1) {
                this.base.appendChild(document.createElement('td'));
            }

            for (let i=0; i<nextProps.row.length + 1; i++) {
                let td = this.base.children[i];
                if (i===0) td.innerHTML = (nextProps.n+1).toString();
                else td.innerHTML = sanitizeStringForHtml(nextProps.row[i-1]);
            }
        } else {
            this.base.setAttribute('style', 'display: none;');
        }

        return false;
    }

    render(props: Props, state: State) {
        return (
            <tr style="display: none;">
            </tr>
        );
    }
}