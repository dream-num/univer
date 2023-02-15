import { BaseComponentProps, Component, ComponentChildren } from '@univerjs/base-ui';
import { PLUGIN_NAMES } from '@univerjs/core';
import { SheetUIPlugin } from '../../..';
import { SHEET_UI_PLUGIN_NAME } from '../../../Basics';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    customLabel?: {
        name: string;
        props: any;
    };
    label?: ComponentChildren;
    id: string;
}

interface IState {
    label: ComponentChildren;
    color: string;
}

export class ColorSelect extends Component<IProps, IState> {
    componentDidMount(): void {
        const componentManager = this.getContext().getPluginManager().getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)?.getComponentManager();
        let label = this.props.label;
        if (this.props.customLabel) {
            const Label = componentManager?.get(this.props.customLabel.name);
            label = <Label {...this.props.customLabel.props}></Label>;
        }
        this.setState({
            label,
            color: '#000',
        });
        this.props.getComponent?.(this);
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
