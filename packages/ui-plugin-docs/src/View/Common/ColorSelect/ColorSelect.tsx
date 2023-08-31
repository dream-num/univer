import { BaseComponentProps, CustomComponent, CustomLabel } from '@univerjs/base-ui';
import { Component, ComponentChildren } from 'preact';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    label?: ComponentChildren | CustomComponent;
    id: string;
    color: string;
}

interface IState {
    color: string;
}

export class ColorSelect extends Component<IProps, IState> {
    override componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    override componentWillReceiveProps(props: IProps) {
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
                <div>
                    <CustomLabel label={label} />
                </div>
                <div className={styles.colorSelectLine} style={{ background: this.state.color }}></div>
            </div>
        );
    }
}
