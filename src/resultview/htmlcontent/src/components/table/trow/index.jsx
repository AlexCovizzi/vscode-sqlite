import { h, Component } from 'preact';

export class TRow extends Component {

    // this component is built manually to perform some optimizations
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!this.base || !this.base.children) return true;
        
        if (nextProps.row) {
            this.base.setAttribute('style', 'visibility: visible;');

            while (this.base.children.length < nextProps.row.length) {
                this.base.appendChild(document.createElement('td'));
            }

            for (let i=0; i<nextProps.row.length; i++) {
                let td = this.base.children[i];
                td.innerHTML = nextProps.row[i];
            }
        } else {
            this.base.setAttribute('style', 'visibility: hidden;');
        }

        return false;
    }

    render(props, state) {
        return (
            <tr>
            </tr>
        );
    }
}