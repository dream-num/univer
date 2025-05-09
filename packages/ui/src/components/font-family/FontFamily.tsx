/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IFontFamilyProps } from './interface';
import { LocaleService } from '@univerjs/core';
import { useMemo } from 'react';

import { useDependency } from '../../utils/di';

export const FontFamily = (props: IFontFamilyProps) => {
    const { value } = props;

    const localeService = useDependency(LocaleService);

    const viewValue = useMemo(() => {
        if (value == null) return '';
        let fontFamily = localeService.t(`fontFamily.${(`${value ?? ''}`).replace(/\s/g, '')}`);

        // Handle font family from copy paste.
        if (fontFamily.startsWith('fontFamily.') && typeof value === 'string') {
            fontFamily = value.split(',')[0];
        }

        return fontFamily;
    }, [value]);

    return (
        <div
            className="univer-w-32 univer-overflow-hidden univer-truncate univer-text-sm"
            style={{ fontFamily: value as string }}
        >
            {viewValue}
        </div>
    );
};
