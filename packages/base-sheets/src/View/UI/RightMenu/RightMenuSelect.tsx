import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';
import { CustomLabelOptions } from '../../../Model';

interface IProps {
    prefix: string;
    options: CustomLabelOptions[];
}

export class RightMenuSelect extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const { prefix, options } = this.props;
        const Input = this._render.renderFunction('Input');

        return (
            <div>
                <div>{prefix}</div>
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
