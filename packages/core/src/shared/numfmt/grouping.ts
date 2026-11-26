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
import { getRegionLocale } from '../../types/enum/locale-type';

const standard = [3, 3] as const;
const paired = [3, 2] as const;

// Excel uses the Windows monetary grouping for both number and currency formats.
// Profiles that use the default three-digit grouping need no entry.
const pairedRegions = new Set([
    'as',
    'as-in',
    'bn',
    'bn-bd',
    'bn-in',
    'brx',
    'brx-in',
    'ccp',
    'ccp-cakm',
    'ccp-cakm-bd',
    'ccp-cakm-in',
    'dz',
    'dz-bt',
    'en-in',
    'gu',
    'gu-in',
    'hi',
    'hi-in',
    'hi-latn',
    'hi-latn-in',
    'ne',
    'ne-in',
    'ne-np',
    'pa',
    'pa-guru',
    'pa-in',
    'sa',
    'sa-in',
    'ta',
    'ta-in',
    'ta-lk',
    'te',
    'te-in',
]);

function resolveNumberGrouping(region?: string): typeof standard | typeof paired {
    const locale = region && getRegionLocale(region);
    if (!locale) return standard;
    if (pairedRegions.has(locale.baseName.toLowerCase())) return paired;
    if (locale.script && locale.region && pairedRegions.has(`${locale.language}-${locale.region.toLowerCase()}`)) return paired;
    return standard;
}

// A workbook formats many cells with the same region.
let lastRegion: string | undefined;
let lastGrouping: typeof standard | typeof paired = standard;

export function getNumberGrouping(region?: string): readonly [number, number] {
    if (lastRegion !== region) {
        lastGrouping = resolveNumberGrouping(region);
        lastRegion = region;
    }
    return lastGrouping;
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
