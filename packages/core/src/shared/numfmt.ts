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

import * as numfmt from 'numfmt';

export * as numfmt from 'numfmt';

export const DEFAULT_TEXT_FORMAT = '@@@'; // Compatible with old data
export const DEFAULT_TEXT_FORMAT_EXCEL = '@'; // The default text format in Excel, recommended
export const DEFAULT_NUMBER_FORMAT = 'General'; // null or General are considered the default format

export function isTextFormat(pattern: string | undefined) {
    return pattern === DEFAULT_TEXT_FORMAT || pattern === DEFAULT_TEXT_FORMAT_EXCEL;
}

export function isDefaultFormat(pattern?: string | null) {
    return pattern === null || pattern === undefined || pattern === DEFAULT_NUMBER_FORMAT;
}

export type INumfmtLocaleTag =
    | 'zh-CN'
    | 'zh-TW'
    | 'cs'
    | 'da'
    | 'nl'
    | 'en'
    | 'fi'
    | 'fr'
    | 'de'
    | 'el'
    | 'hu'
    | 'is'
    | 'id'
    | 'it'
    | 'ja'
    | 'ko'
    | 'nb'
    | 'pl'
    | 'pt'
    | 'ru'
    | 'sk'
    | 'es'
    | 'sv'
    | 'th'
    | 'tr'
    | 'vi';

    /**
     * Determines whether two patterns are equal, excluding differences in decimal places.
     * This function ignores the decimal part of the patterns and the positive color will be ignored but negative color will be considered.
     * more info can check the test case.
     */
export const isPatternEqualWithoutDecimal = (patternA: string, patternB: string): boolean => {
    if ((patternA && !patternB) || (!patternA && patternB)) {
        return false;
    }

    const getStringWithoutDecimal = (pattern: string): string => {
        const tokens = numfmt.tokenize(pattern);
        let result = '';
        let isDecimalPart = false;
        let isColorBefore = false;

        for (const token of tokens) {
            if (token.type === numfmt.tokenTypes.POINT) {
                isDecimalPart = true; // Start ignoring tokens after the decimal point
                continue;
            }
            // for the excel number

            // this if should be before the color token check
            if (isColorBefore && token.type === numfmt.tokenTypes.MINUS) {
                // ignore the minus token in the decimal part after the color token
                continue;
            }

            if (token.type === numfmt.tokenTypes.SKIP) {
                // Skip tokens that are not relevant to the string representation
                continue;
            }

            if (token.type === numfmt.tokenTypes.COLOR) {
                isColorBefore = true; // If we are in the decimal part, we ignore the color tokens
                continue;
            } else {
                isColorBefore = false; // Reset after processing the color part
            }

            if (isDecimalPart && token.type === numfmt.tokenTypes.ZERO) {
                // If we are in the decimal part, we ignore the number tokens
                continue;
            } else {
                isDecimalPart = false; // Reset after processing the decimal part
            }

            if (!isDecimalPart) {
                result += token.value || '';
            }
        }

        return result;
    };

    const normalizedA = getStringWithoutDecimal(patternA);
    const normalizedB = getStringWithoutDecimal(patternB);

    return normalizedA === normalizedB;
};
