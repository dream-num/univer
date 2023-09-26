import { Icon } from '@univerjs/base-ui';
import { Component } from 'react';

interface IProps {
    label: string;
}

export class FormulaLabel extends Component<IProps> {
    render() {
        // const SumIcon = this._render.renderFunction('SumIcon');
        const { label } = this.props;

        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon.Data.SumIcon />
                {label}
            </div>
        );
    }
}
