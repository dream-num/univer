import { CustomLabel, Input } from '@univerjs/base-ui';
import { Component } from 'preact';

interface IProps {
    prefix: string;
    suffix: string;
    onKeyUp?: (e: Event) => void;
    onChange?: (e: Event) => void;
}

export class RightMenuInput extends Component<IProps> {
    handleClick(e: Event) {
        e.stopPropagation();
    }

    handleKeyUp(e: Event) {
        const { onKeyUp } = this.props;
        onKeyUp?.(e);
    }

    onChange(e: Event) {
        const { onChange } = this.props;
        onChange?.(e);
    }

    render() {
        const { prefix, suffix } = this.props;
        return (
            <div>
                <CustomLabel label={prefix} />
                <Input onPressEnter={this.handleKeyUp.bind(this)} type="number" placeholder="1" onClick={this.handleClick.bind(this)} onChange={this.onChange.bind(this)}></Input>
                <CustomLabel label={suffix} />
            </div>
        );
    }
}
