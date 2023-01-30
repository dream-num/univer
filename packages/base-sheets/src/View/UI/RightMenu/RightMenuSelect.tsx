import { BaseComponentRender, BaseComponentSheet, Component } from '@univerjs/base-component';
import { CustomLabelOptions } from '../../../Model';

interface IProps {
    label: string;
    options: CustomLabelOptions[];
}

export class RightMenuSelect extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const { label, options } = this.props;
        const Input = this._render.renderFunction('Input');

        return (
            <div>
                <div>{label}</div>
                <select>
                    {options.map((item) => (
                        <option>{item.label}</option>
                    ))}
                </select>
                <Input type="number" placeholder="2"></Input>
            </div>
        );
    }
}
