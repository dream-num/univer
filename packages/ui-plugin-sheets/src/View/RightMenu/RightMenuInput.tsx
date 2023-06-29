import { Component, Input } from '@univerjs/base-ui';

interface IProps {
    prefix: string;
    suffix: string;
    onKeyUp?: (e: Event) => void;
}

export class RightMenuInput extends Component<IProps> {
    handleClick(e: Event) {
        e.stopPropagation();
    }

    handleKeyUp(e: Event) {
        const { onKeyUp } = this.props;
        onKeyUp?.(e);
    }

    render() {
        const { prefix, suffix } = this.props;
        return (
            <div>
                {this.getLabel(prefix)}
                <Input onPressEnter={this.handleKeyUp.bind(this)} type="number" placeholder="1" onClick={this.handleClick}></Input>
                {this.getLabel(suffix)}
            </div>
        );
    }
}
