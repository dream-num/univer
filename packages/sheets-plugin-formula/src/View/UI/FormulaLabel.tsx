import { Component, BaseComponentSheet, BaseComponentRender } from '@univerjs/base-component';

interface IProps {
    label: string;
}

export class FormulaLabel extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        // super();
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const SumIcon = this._render.renderFunction('SumIcon');
        const { label } = this.props;

        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <SumIcon />
                {label}
            </div>
        );
    }
}
