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

import { numfmt } from '@univerjs/core';

/**
 * the function decimal just use positive,negative configuration ignored
 */
export const getDecimalFromPattern = (pattern: string, defaultValue: number = 0) => {
    if (!pattern) {
        return defaultValue;
    }

    const info = numfmt.getFormatInfo(pattern);
    return info.maxDecimals ?? defaultValue;
};

export const getDecimalString = (length: number) =>
    new Array(Math.min(Math.max(0, Number(length)), 30)).fill(0).join('');

export const setPatternDecimal = (patterns: string, decimalLength: number) => {
    const tokens = patterns.split(';').map((pattern) => {
        if (/\.0?/.test(pattern)) {
            return pattern.replace(
                /\.0*/g,
                `${decimalLength > 0 ? '.' : ''}${getDecimalString(Number(decimalLength || 0))}`
            );
        }
        if (/0([^0]?)|0$/.test(pattern)) {
            return pattern.replace(
                /0([^0]+)|0$/,
                `0${decimalLength > 0 ? '.' : ''}${getDecimalString(Number(decimalLength || 0))}$1`
            );
        }

        return pattern;
    });
    return tokens.join(';');
};

export const isPatternHasDecimal = (pattern: string) => /\.0?/.test(pattern) || /0([^0]?)|0$/.test(pattern);
