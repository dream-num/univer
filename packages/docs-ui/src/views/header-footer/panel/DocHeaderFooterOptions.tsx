/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { LocaleService } from '@univerjs/core';
import clsx from 'clsx';
import styles from './index.module.less';

export const DocHeaderFooterOptions = () => {
    const localeService = useDependency(LocaleService);

    return (
        <div className={styles.options}>
            <div className={styles.optionsSection}>
                <div className={styles.optionsFormItem}>
                    <Checkbox checked={false} onChange={() => { }}>{localeService.t('headerFooter.firstPageCheckBox')}</Checkbox>
                </div>
                <div className={styles.optionsFormItem}>
                    <Checkbox checked={true} onChange={() => { }}>{localeService.t('headerFooter.oddEvenCheckBox')}</Checkbox>
                </div>
            </div>
            <div className={clsx(styles.optionsSection, styles.optionsMarginSetting)}>
                <div className={styles.optionsMarginItem}>
                    <span>{localeService.t('headerFooter.headerTopMargin')}</span>
                    <InputNumber precision={0.1} value={5} onChange={() => {}} className={styles.optionsInput} />
                </div>
                <div className={styles.optionsMarginItem}>
                    <span>{localeService.t('headerFooter.footerBottomMargin')}</span>
                    <InputNumber precision={0.1} value={5} onChange={() => {}} className={styles.optionsInput} />
                </div>
            </div>
            <div className={styles.optionsSection}>
                <Button>{localeService.t('headerFooter.closeHeaderFooter')}</Button>
            </div>
        </div>
    );
};

