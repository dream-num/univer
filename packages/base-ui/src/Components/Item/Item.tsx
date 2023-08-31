import { ComponentChildren, Component } from 'preact';
import { BaseMenuItem } from '../../Interfaces';
import { joinClassNames } from '../../Utils';
import { CustomLabel } from '../CustomLabel';
import styles from './index.module.less';
import { Icon } from '..';

export interface BaseItemProps extends BaseMenuItem {
    selected?: boolean;
    suffix?: ComponentChildren;
    border?: boolean;
}

export class Item extends Component<BaseItemProps> {
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
                <span className={styles.selectItemContent}>
                    <CustomLabel label={label} />
                </span>
                {suffix ? (
                    <span className={styles.selectItemSuffix}>
                        <CustomLabel label={suffix} />
                    </span>
                ) : (
                    ''
                )}
            </div>
        );
    }
}
