import { BaseComponentProps, CustomLabel, Icon } from '@univerjs/base-ui';
import { Component } from 'react';

interface IState {
    color: string;
}

interface IProps extends BaseComponentProps {
    color: string;
    label?: string;
}

export class LineColor extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            color: this.props.color,
        };
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    override UNSAFE_componentWillReceiveProps(props: IProps): void {
        this.setState({
            color: props.color,
        });
    }

    setColor(color: string) {
        this.setState({
            color,
        });
    }

    render() {
        const { color } = this.state;
        const { label } = this.props;

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', borderBottom: `3px solid ${color}` }}>
                    <CustomLabel label={label} />
                </span>
                <Icon.RightIcon />
            </div>
        );
    }
}
