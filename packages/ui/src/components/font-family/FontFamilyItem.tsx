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

import { LocaleService, useDependency } from '@univerjs/core';
import React from 'react';

import styles from './index.module.less';
import type { IFontFamilyItemProps } from './interface';

export const FontFamilyItem = (props: IFontFamilyItemProps) => {
    const { value } = props;

    const localeService = useDependency(LocaleService);

    return (
        <span className={styles.uiPluginSheetsFontFamilyItem} style={{ fontFamily: value }}>
            {localeService.t(`fontFamily.${(`${value ?? ''}`).replace(/\s/g, '')}`)}
        </span>
    );
};
