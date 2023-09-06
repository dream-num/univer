import { AppContext, AppContextValues, BaseMenuItem, Icon, joinClassNames } from '@univerjs/base-ui';
import { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';

import styles from './FormatItem.module.less';

export interface BaseFormatItemProps extends BaseMenuItem {
    selected?: boolean;
    labelText?: string;
    suffix?: ComponentChildren;
    border?: boolean;
    onValueChange: (v: string | number) => void;
}

function getLocale(context: Partial<AppContextValues>, name: string) {
    return context.localeService?.t(name);
}

/**
 * FormatItem
 */
export function FormatItem(props: BaseFormatItemProps): JSX.Element {
    const { selected, labelText, suffix, disabled, value, onValueChange } = props;
    const context = useContext(AppContext);

    return (
        <div className={joinClassNames(styles.formatItem, disabled ? styles.selectDisabledItem : '')} onClick={() => onValueChange(value)}>
            {selected && (
                <span className={styles.formatItemSelected}>
                    <Icon.CorrectIcon />
                </span>
            )}
            <span className={styles.formatItemContent}>{getLocale(context, labelText as string)}</span>
            {suffix && <span className={styles.formatItemSuffix}>{getLocale(context, suffix as string)}</span>}
        </div>
    );
}
