import { ComponentChildren, Component } from '../../Framework';
import { BaseMenuItem } from '../../Interfaces';
import { joinClassNames } from '../../Utils';
import styles from './index.module.less';
import { Icon } from '..';

export interface BaseItemProps extends BaseMenuItem {
    selected?: boolean;
    suffix?: ComponentChildren;
    border?: boolean;
}

export class Item extends Component<BaseItemProps> {
    getLabelLocale(label: ComponentChildren) {
        if (typeof label === 'string') {
            return this.getLocale(label);
        }
    }

    render() {
        const { selected, label, suffix, disabled } = this.props;
        return (
            <div className={joinClassNames(styles.selectItem, disabled ? styles.selectDisabledItem : '')}>
                {selected ? (
                    <span className={styles.selectItemSelected}>
                        <Icon.CorrectIcon />
                    </span>
                ) : (
                    ''
                )}
                <span className={styles.selectItemContent}>{this.getLabelLocale(label)}</span>
                {suffix ? <span className={styles.selectItemSuffix}>{suffix}</span> : ''}
            </div>
        );
    }
}
