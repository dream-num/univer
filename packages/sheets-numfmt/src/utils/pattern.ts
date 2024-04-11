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

import numfmt from '@univerjs/engine-numfmt';
import { LocaleType } from '@univerjs/core';
import type { FormatType } from '@univerjs/sheets';

export const getPatternType = (pattern: string): FormatType => numfmt.getInfo(pattern).type || 'unknown';
export const getPatternPreview = (pattern: string, value: number, _locale?: LocaleType) => {
    const info = numfmt.getInfo(pattern);
    const locale = _locale === LocaleType.ZH_CN ? 'zh-CN' : 'en';
    const negInfo = info._partitions[1];
    const result = numfmt.format(pattern, value, { locale });
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
