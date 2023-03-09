import { BaseComponentProps, Component, ComponentChildren } from '@univerjs/base-ui';
import { DocUIPlugin } from '../../..';
import { DOC_UI_PLUGIN_NAME } from '../../../Basics';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    customLabel?: {
        name: string;
        props: any;
    };
    label?: ComponentChildren;
    id: string;
    color: string;
}

interface IState {
    label: ComponentChildren;
    color: string;
}

export class ColorSelect extends Component<IProps, IState> {
    componentDidMount(): void {
        const componentManager = this.getContext().getPluginManager().getPluginByName<DocUIPlugin>(DOC_UI_PLUGIN_NAME)?.getComponentManager();
        let label = this.props.label;
        if (this.props.customLabel) {
            const Label = componentManager?.get(this.props.customLabel.name);
            label = <Label {...this.props.customLabel.props}></Label>;
        }
        this.setState({
            label,
            color: this.props.color,
        });
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
        return (
            <div className={styles.colorSelect}>
                <div>{this.state.label}</div>
                <div className={styles.colorSelectLine} style={{ background: this.state.color }}></div>
            </div>
        );
    }
}
