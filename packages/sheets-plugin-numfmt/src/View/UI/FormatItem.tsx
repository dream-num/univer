import { joinClassNames } from '@univerjs/base-ui';
import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';

import styles from './FormatItem.module.less';

export interface BaseFormatItemProps {
    selected?: boolean;
    labelText?: string;
    suffix?: string;
    border?: boolean;
    disabled?: boolean;
    value?: string;
}

/**
 * FormatItem
 */
export function FormatItem(props: BaseFormatItemProps): JSX.Element {
    const { selected, labelText, suffix, disabled, value } = props;
    const localeService = useDependency(LocaleService);

    return (
        <div className={joinClassNames(styles.formatItem, disabled ? styles.selectDisabledItem : '')}>
            {selected && <span className={styles.formatItemSelected}>{/* <Icon.CorrectIcon /> */}</span>}
            <span className={styles.formatItemContent}>{localeService.t(labelText as string) || labelText}</span>
            {suffix && <span className={styles.formatItemSuffix}>{localeService.t(suffix as string) || suffix}</span>}
        </div>
    );
}
