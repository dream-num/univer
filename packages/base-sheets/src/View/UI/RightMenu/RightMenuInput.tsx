import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';

interface IProps {
    prefix: string[];
    suffix: string;
}

export class RightMenuInput extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const { prefix, suffix } = this.props;
        const Input = this._render.renderFunction('Input');

        return (
            <div>
                {prefix}
                <Input type="number" placeholder="1"></Input>
                {suffix}
            </div>
        );
    }
}
