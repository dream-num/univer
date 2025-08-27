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

import type { INumfmtLocaleTag } from '@univerjs/core';
import type { FormatType } from '@univerjs/sheets';
import { DEFAULT_NUMBER_FORMAT, numfmt } from '@univerjs/core';
import { stripErrorMargin } from '@univerjs/engine-formula';

export const getPatternType = (pattern: string): FormatType => numfmt.getFormatInfo(pattern).type || 'unknown';
interface IPatternPreview {
    result: string;
    color?: string;
}

export const getPatternPreview = (pattern: string, value: number, locale: INumfmtLocaleTag = 'en'): IPatternPreview => {
    // in the source code of numfmt, the formatColor function will read the the partitions[3]
    const formatColor = numfmt.formatColor(pattern, value);
    const color = formatColor ? String(formatColor) : undefined;
    const result = numfmt.format(pattern, value, { locale, throws: false });
    if (value < 0) {
        // pay attention, controllers/numfmt.controller.ts
        // in the pattern, the negative value color may be upper case one , so if we read a color with UpperCase, we should return the color with lower case for our theme system
        return {
            result,
            color,
        };
    }
    return {
        result,
    };
};

export const getPatternPreviewIgnoreGeneral = (pattern: string, value: number, locale?: INumfmtLocaleTag): IPatternPreview => {
    if (pattern === DEFAULT_NUMBER_FORMAT) {
        return {
            result: String(stripErrorMargin(value)), // In Excel, the default General format also needs to handle numeric precision.
        };
    }
    return getPatternPreview(pattern, value, locale);
};

const ignoreCommonPatterns = new Set(['m d']);
const ignoreAMPMPatterns = new Set(['h:mm AM/PM', 'hh:mm AM/PM']);

/**
 * Get the numfmt parse value, and filter out the parse error.
 */
export const getNumfmtParseValueFilter = (value: string): numfmt.ParseData | null => {
    const parseData = numfmt.parseDate(value) ?? numfmt.parseTime(value) ?? numfmt.parseNumber(value);

    if (!parseData) return null;

    const { z } = parseData;

    if (z) {
        /**
         * '1 23' => 'm d' ----- error
         * '2/3' => 'm/d' ----- This is supported by Excel
         */
        if (ignoreCommonPatterns.has(z)) return null;

        /**
         * If the pattern is 'h:mm AM/PM' or 'hh:mm AM/PM', we need to check if the value ends with ' A', ' P', ' AM', or ' PM'.
         * '5A' => 'h:mm AM/PM' ----- error
         * '5 A' => 'h:mm AM/PM' ----- This is supported by Excel
         * '5:00 AM' => 'h:mm AM/PM' ----- correct
         */
        if (ignoreAMPMPatterns.has(z) && !/\s(A|AM|P|PM)$/i.test(value)) return null;
    }

    return parseData;
};
