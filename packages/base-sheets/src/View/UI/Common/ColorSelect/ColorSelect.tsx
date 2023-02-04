import { Component, ComponentChildren } from '@univerjs/base-component';
import { PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '../../../../SheetPlugin';
import styles from './index.module.less';

interface IProps {
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
        this._context.getObserverManager().getObserver<ColorSelect>('onColorSelectDidMountObservable')?.notifyObservers(this);
        const plugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
        let label = this.props.label;
        if (this.props.customLabel) {
            const Label = plugin?.getRegisterComponent(this.props.customLabel.name);
            label = <Label {...this.props.customLabel.props}></Label>;
        }
        this.setState({
            label,
            color: '#000',
        });
    }

    setColor(color: string) {
        this.setState({
            color,
        });
    }

    getId() {
        return this.props.id;
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
