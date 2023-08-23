import { BaseComponentRender, Component, Input } from '@univerjs/base-ui';

interface IProps {
    prefix?: string;
    placeholder1?: string;
    suffix?: string;
    placeholder2?: string;
}

export class ClipboardInput extends Component<IProps> {
    private _render: BaseComponentRender;

    override initialize() {}

    render() {
        const { prefix, placeholder1, suffix, placeholder2 } = this.props;

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
