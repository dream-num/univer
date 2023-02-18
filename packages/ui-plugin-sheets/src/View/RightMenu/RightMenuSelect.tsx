import { Component, Input } from '@univerjs/base-ui';
import { CustomLabelOptions } from '../../Controller';

interface IProps {
    label: string;
    options: CustomLabelOptions[];
}

export class RightMenuSelect extends Component<IProps> {
    render() {
        const { label, options } = this.props;

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
