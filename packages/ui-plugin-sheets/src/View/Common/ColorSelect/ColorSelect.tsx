import { BaseComponentProps, ICustomComponent, CustomLabel } from '@univerjs/base-ui';
import { Component, ComponentChildren } from 'react';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    label?: ComponentChildren | ICustomComponent;
    id: string;
    color: string;
}

interface IState {
    color: string;
}

// TODO: @wzhudev: why this component is put under ui-plugin-sheet not base-ui?
/** @deprecated use ColorSelect in base-ui plugin instead */
export class ColorSelect extends Component<IProps, IState> {
    override componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    override UNSAFE_componentWillReceiveProps(props: IProps) {
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
