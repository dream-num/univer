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

import type { DateSystem, INumfmtLocaleTag } from '@univerjs/core';
import type { FormatType } from '@univerjs/sheets';
import { DEFAULT_NUMBER_FORMAT, numfmt } from '@univerjs/core';
import { stripErrorMargin } from '@univerjs/engine-formula';

export const getPatternType = (pattern: string): FormatType => {
    const type = numfmt.getFormatInfo(pattern).type || 'unknown';
    if (type === 'general' && numfmt.tokenize(pattern).some((token) => token.type === numfmt.tokenTypes.CONDITION)) {
        return 'number';
    }

    return type;
};
interface IPatternPreview {
    result: string;
    color?: string;
}

export const getPatternPreview = (
    pattern: string,
    value: number,
    locale: INumfmtLocaleTag = 'en',
    dateSystem?: DateSystem
): IPatternPreview => {
    try {
        const formatColor = numfmt.formatColor(pattern, value);
        const color = formatColor ? String(formatColor) : undefined;
        const result = numfmt.format(pattern, value, { locale, dateSystem, throws: false });
        return {
            result,
            color,
        };
    } catch (e) {
        console.warn('getPatternPreview error:', pattern, e);
    }

    return {
        result: String(value),
    };
};

export const getPatternPreviewIgnoreGeneral = (
    pattern: string,
    value: number,
    locale?: INumfmtLocaleTag,
    dateSystem?: DateSystem
): IPatternPreview => {
    if (pattern === DEFAULT_NUMBER_FORMAT) {
        return {
            result: String(stripErrorMargin(value)), // In Excel, the default General format also needs to handle numeric precision.
        };
    }
    return getPatternPreview(pattern, value, locale, dateSystem);
};
