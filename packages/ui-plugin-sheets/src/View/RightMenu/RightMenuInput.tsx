import { CustomLabel, ICustomComponentProps, Input } from '@univerjs/base-ui';
import { Component } from 'preact';

interface IProps extends ICustomComponentProps<string> {
    prefix: string;
    suffix: string;
    onKeyUp?: (e: Event) => void;
}

export class RightMenuInput extends Component<IProps> {
    private value = '';

    render() {
        const { prefix, suffix, value } = this.props;
        return (
            <div onClick={(e) => this.handleClick(e)}>
                <CustomLabel label={prefix} />
                <Input type="number" placeholder="1" value={value} onClick={(e) => e.stopPropagation()} onChange={this.onChange.bind(this)}></Input>
                <CustomLabel label={suffix} />
            </div>
        );
    }

    private handleClick(e: Event) {
        e.stopPropagation();
        this.props.onChange?.(this.value);
    }

    private onChange(e: Event) {
        this.value = (e.target as HTMLInputElement).value;
    }
}
