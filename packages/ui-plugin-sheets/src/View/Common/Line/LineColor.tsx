import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, Component, Icon } from '@univerjs/base-ui';

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
            color: 'rgb(217,217,217)',
        };
    }

    componentDidMount() {
        this.props.getComponent?.(this);
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
                <span style={{ display: 'inline-block', borderBottom: `3px solid ${color}` }}>{this.getLocale(label)}</span>
                <Icon.RightIcon />
            </div>
        );
    }
}
