import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';

interface IProps {
    prefix?: string;
    placeholder1?: string;
    suffix?: string;
    placeholder2?: string;
}

export class ClipboardInput extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const { prefix, placeholder1, suffix, placeholder2 } = this.props;
        const Input = this._render.renderFunction('Input');

        return (
            <div>
                {prefix}
                <Input type="number" placeholder={placeholder1}></Input>
                {suffix || '×'}
                {placeholder2 ? <Input type="number" placeholder={placeholder2}></Input> : ''}
            </div>
        );
    }
}
