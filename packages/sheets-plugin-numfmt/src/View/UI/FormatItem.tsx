import { AppContext, AppContextValues, BaseMenuItem, joinClassNames } from '@univerjs/base-ui';
import React, { useContext } from 'react';

import styles from './FormatItem.module.less';

export interface BaseFormatItemProps extends BaseMenuItem {
    selected?: boolean;
    labelText?: string;
    suffix?: React.ReactNode;
    border?: boolean;
}

function getLocale(context: Partial<AppContextValues>, name: string) {
    return context.localeService?.t(name);
}

/**
 * FormatItem
 */
export function FormatItem(props: BaseFormatItemProps): JSX.Element {
    const { selected, labelText, suffix, disabled, value } = props;
    const context = useContext(AppContext);

    return (
        <div className={joinClassNames(styles.formatItem, disabled ? styles.selectDisabledItem : '')}>
            {selected && <span className={styles.formatItemSelected}>{/* <Icon.CorrectIcon /> */}</span>}
            <span className={styles.formatItemContent}>{getLocale(context, labelText as string) || labelText}</span>
            {suffix && (
                <span className={styles.formatItemSuffix}>{getLocale(context, suffix as string) || suffix}</span>
            )}
        </div>
    );
}
