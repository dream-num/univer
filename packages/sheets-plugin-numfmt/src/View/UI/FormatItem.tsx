import { BaseMenuItem, CustomLabel, Icon, joinClassNames } from "@univerjs/base-ui";
import { BaseItemProps } from "@univerjs/base-ui/src/Components/Item/Item";
import { ComponentChildren, Component } from "preact";
import styles from './FormatItem.module.less';

export interface BaseFormatItemProps extends BaseMenuItem {
    selected?: boolean;
    suffix?: ComponentChildren;
    border?: boolean;
    onValueChange: (v: string | number)=>void
}

/**
 * FormatItem
 */
export class FormatItem extends Component<BaseFormatItemProps> {
    render() {
        const { selected, label, suffix, disabled,value, onValueChange } = this.props;

        return (
            <div className={joinClassNames(styles.formatItem, disabled ? styles.selectDisabledItem : '')}
            onClick={()=>onValueChange(value)}
            >
                {selected && (
                    <span className={styles.formatItemSelected}>
                        <Icon.CorrectIcon />
                    </span>
                )}
                <span className={styles.formatItemContent}>
                    <CustomLabel label={label} />
                </span>
                {suffix && (
                    <span className={styles.formatItemSuffix}>
                        <CustomLabel label={suffix} />
                    </span>
                )}
            </div>
        );
    }
}
