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

import type { INumfmtLocalTag } from '@univerjs/core';
import type { FormatType } from '@univerjs/sheets';
import { numfmt } from '@univerjs/core';
import { stripErrorMargin } from '@univerjs/engine-formula';

export const getPatternType = (pattern: string): FormatType => numfmt.getInfo(pattern).type || 'unknown';
interface IPatternPreview {
    result: string;
    color?: string;
}

export const getPatternPreview = (pattern: string, value: number, locale: INumfmtLocalTag = 'en'): IPatternPreview => {
    const info = numfmt.getInfo(pattern);
    const negInfo = info._partitions[1];

    const result = numfmt.format(pattern, value, { locale, throws: false });
    if (value < 0) {
        return {
            result,
            color: negInfo.color,
        };
    }
    return {
        result,
    };
};

export const getPatternPreviewIgnoreGeneral = (pattern: string, value: number, locale?: INumfmtLocalTag): IPatternPreview => {
    if (pattern === 'General') {
        return {
            result: String(stripErrorMargin(value)), // In Excel, the default General format also needs to handle numeric precision.
        };
    }
    return getPatternPreview(pattern, value, locale);
};
