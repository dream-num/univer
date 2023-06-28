import { BaseComponentProps, Component, Icon } from '@univerjs/base-ui';

interface IState {
    color: string;
}

interface IProps extends BaseComponentProps {
    color: string;
    label?: string;
}

export class LineColor extends Component<IProps, IState> {
    initialize() {
        this.state = {
            color: this.props.color,
        };
    }

    componentDidMount() {
        this.props.getComponent?.(this);
    }

    componentWillReceiveProps(props: IProps): void {
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
                <span style={{ display: 'inline-block', borderBottom: `3px solid ${color}` }}>{this.getLabel(label)}</span>
                <Icon.RightIcon />
            </div>
        );
    }
}
