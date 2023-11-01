import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';

import styles from './index.module.less';
import { IFontFamilyProps } from './interface';

export const FontFamily = (props: IFontFamilyProps) => {
    const { value } = props;

    const localeService = useDependency(LocaleService);

    return (
        <div className={styles.uiPluginSheetsFontFamily} style={{ fontFamily: value as string }}>
            {localeService.t(`fontFamily.${(`${value}` ?? '').replace(/\s/g, '')}`)}
        </div>
    );
};
