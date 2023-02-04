import { BaseComponentRender, BaseComponentSheet } from '../../BaseComponent';
import { Component } from '../../Framework';
import styles from './index.module.less';

interface IProps {
    label: string;
}

export class RightMenuItem extends Component<IProps> {
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();
    }

    render() {
        const { label } = this.props;
        const RightIcon = this._render.renderFunction('RightIcon');

        return (
            <div className={styles.rightMenuItem}>
                {label}
                <RightIcon />
            </div>
        );
    }
}
