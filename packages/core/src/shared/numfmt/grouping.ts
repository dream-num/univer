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

import type { NumberGrouping } from './types';
import { getRegionTag } from '../../types/enum/locale-type';

interface IRegionGrouping {
    readonly number: NumberGrouping;
    readonly currency: NumberGrouping;
}

const standard = [3, 3] as const;
const twoDigitGroups = [3, 2] as const;
const standardGrouping = { number: standard, currency: standard };
const pairedGrouping = { number: twoDigitGroups, currency: twoDigitGroups };
const standardCurrencyGrouping = { number: twoDigitGroups, currency: standard };

// Defaults from Windows GetLocaleInfoEx (LOCALE_SGROUPING and LOCALE_SMONGROUPING).
// Only profiles that differ from the standard three-digit grouping are listed.
const regionGrouping = new Map<string, IRegionGrouping>([
    ['as', pairedGrouping],
    ['as-in', pairedGrouping],
    ['bn', pairedGrouping],
    ['bn-bd', pairedGrouping],
    ['bn-in', pairedGrouping],
    ['brx', pairedGrouping],
    ['brx-in', pairedGrouping],
    ['ccp', pairedGrouping],
    ['ccp-cakm', pairedGrouping],
    ['ccp-cakm-bd', pairedGrouping],
    ['ccp-cakm-in', pairedGrouping],
    ['dz', pairedGrouping],
    ['dz-bt', pairedGrouping],
    ['en-in', pairedGrouping],
    ['gu', pairedGrouping],
    ['gu-in', pairedGrouping],
    ['hi', pairedGrouping],
    ['hi-in', pairedGrouping],
    ['hi-latn', pairedGrouping],
    ['hi-latn-in', pairedGrouping],
    ['ml', standardCurrencyGrouping],
    ['ml-in', standardCurrencyGrouping],
    ['mr', standardCurrencyGrouping],
    ['mr-in', standardCurrencyGrouping],
    ['ne', pairedGrouping],
    ['ne-in', pairedGrouping],
    ['ne-np', pairedGrouping],
    ['or', standardCurrencyGrouping],
    ['or-in', standardCurrencyGrouping],
    ['pa', pairedGrouping],
    ['pa-guru', pairedGrouping],
    ['pa-in', pairedGrouping],
    ['sa', pairedGrouping],
    ['sa-in', pairedGrouping],
    ['ta', pairedGrouping],
    ['ta-in', pairedGrouping],
    ['ta-lk', pairedGrouping],
    ['te', pairedGrouping],
    ['te-in', pairedGrouping],
]);

export function getRegionGrouping(region?: string): IRegionGrouping {
    return region ? regionGrouping.get(getRegionTag(region).toLowerCase()) ?? standardGrouping : standardGrouping;
}

export function getNumberGrouping(region?: string, currency = false): NumberGrouping {
    const grouping = getRegionGrouping(region);
    return currency ? grouping.currency : grouping.number;
}

// The tuple predates explicit grouping sequences. It repeats the second size,
// or the first size if only one size was supplied.
export function isGroupingBoundary(digitsToRight: number, grouping: NumberGrouping): boolean {
    if (digitsToRight <= 0) return false;
    if (!('sizes' in grouping)) {
        const [primary = 3, secondary = primary] = grouping;
        const offset = digitsToRight - primary;
        return offset >= 0 && offset % secondary === 0;
    }

    let remainder = digitsToRight;
    let lastSize = 0;
    for (const size of grouping.sizes) {
        if (!Number.isInteger(size) || size <= 0) return false;
        remainder -= size;
        if (remainder <= 0) return remainder === 0;
        lastSize = size;
    }
    return grouping.repeatLast && lastSize > 0 && remainder % lastSize === 0;
}

export function groupIntegerDigits(digits: string, separator: string, grouping: NumberGrouping): string {
    let result = '';
    for (let index = 0; index < digits.length; index++) {
        result += digits[index];
        if (isGroupingBoundary(digits.length - index - 1, grouping)) {
            result += separator;
        }
    }
    return result;
}
