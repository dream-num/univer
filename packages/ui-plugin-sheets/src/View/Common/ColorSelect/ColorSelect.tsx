import { BaseComponentProps, Component, ComponentChildren, CustomComponent } from '@univerjs/base-ui';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    label?: ComponentChildren | CustomComponent;
    id: string;
    color: string;
}

interface IState {
    label: ComponentChildren;
    color: string;
}

export class ColorSelect extends Component<IProps, IState> {
    componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    componentWillReceiveProps(props: IProps) {
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
        const { label } = this.props;
        return (
            <div className={styles.colorSelect}>
                <div>{this.getLabel(label)}</div>
                <div className={styles.colorSelectLine} style={{ background: this.state.color }}></div>
            </div>
        );
    }
}
