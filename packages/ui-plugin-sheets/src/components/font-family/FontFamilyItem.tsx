import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';

import styles from './index.module.less';
import { IFontFamilyItemProps } from './interface';

export const FontFamilyItem = (props: IFontFamilyItemProps) => {
    const { value } = props;

    const localeService = useDependency(LocaleService);

    return (
        <span className={styles.uiPluginSheetsFontFamilyItem} style={{ fontFamily: value }}>
            {localeService.t(`fontFamily.${(`${value}` ?? '').replace(/\s/g, '')}`)}
        </span>
    );
};
