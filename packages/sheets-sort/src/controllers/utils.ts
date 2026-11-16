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

import type { ICellData, Nullable } from '@univerjs/core';
import type { ICommonComparableCellValue } from './sheets-sort.controller';
import { SortType } from '../services/interface';

export enum ORDER {
    POSITIVE = 1,
    NEGATIVE = -1,
    ZERO = 0,
}

export type TextComparer = (a: string, b: string) => number;

// Excel sorts text left to right: digits, then spaces and punctuation in this order, then letters.
const EXCEL_SYMBOL_ORDER = ' !"#$%&()*,./:;?@[\\]^_`{|}~+<=>';

enum UnitClass {
    DIGIT = 0,
    SYMBOL = 1,
    LETTER = 2,
}

const DIGIT_START = /^\p{Nd}/u;
const LETTER_START = /^[\p{L}\p{M}]/u;
const TEXT_UNITS = /[\p{L}\p{M}]+|[^\p{L}\p{M}]/gu;

const unitClass = (unit: string): UnitClass => {
    if (DIGIT_START.test(unit)) return UnitClass.DIGIT;
    if (LETTER_START.test(unit)) return UnitClass.LETTER;
    return UnitClass.SYMBOL;
};

const symbolRank = (symbol: string) => {
    const rank = EXCEL_SYMBOL_ORDER.indexOf(symbol);
    return rank === -1 ? EXCEL_SYMBOL_ORDER.length : rank;
};

const compareUnit = (a: string, b: string, collator: Intl.Collator) => {
    const classA = unitClass(a);
    const classB = unitClass(b);

    if (classA !== classB) return classA - classB;

    if (classA === UnitClass.SYMBOL) {
        return symbolRank(a) - symbolRank(b) || (a < b ? -1 : a > b ? 1 : 0);
    }

    return collator.compare(a, b);
};

const compareUnits = (a: string[], b: string[], collator: Intl.Collator) => {
    const length = Math.min(a.length, b.length);

    for (let i = 0; i < length; i++) {
        const order = compareUnit(a[i], b[i], collator);
        if (order !== 0) return order;
    }

    return a.length - b.length;
};

/**
 * Compares text in Excel's order: runs of letters by the locale's collation, so an accented
 * letter sorts beside its base letter, and digits before spaces and punctuation before letters.
 * Accents only break ties between texts that are otherwise equal.
 */
export const createTextComparer = (locale?: string): TextComparer => {
    const baseCollator = new Intl.Collator(locale, { sensitivity: 'base' });
    const accentCollator = new Intl.Collator(locale, { sensitivity: 'accent' });

    return (a, b) => {
        if (a === b) return 0;

        const unitsA = a.match(TEXT_UNITS) ?? [];
        const unitsB = b.match(TEXT_UNITS) ?? [];

        return compareUnits(unitsA, unitsB, baseCollator) || compareUnits(unitsA, unitsB, accentCollator);
    };
};

/** Univer locales are written `enUS`; Intl expects `en-US`. */
export const createRegionTextComparer = (region: string): TextComparer => {
    try {
        return createTextComparer(region.replace(/^([a-z]{2,3})([A-Z]{2})$/, '$1-$2'));
    } catch {
        return createTextComparer();
    }
};

const defaultTextComparer = createTextComparer();

const removeStringSymbol = (str: string) => {
    return str.replace(/-/gi, '').replace(/'/gi, '');
};

export const compareNull = (
    a1: ICommonComparableCellValue,
    a2: ICommonComparableCellValue
) => {
    const isA1Null = a1 === null || a1 === '';
    const isA2Null = a2 === null || a2 === '';

    if (isA1Null && isA2Null) return ORDER.ZERO;

    if (isA1Null) return ORDER.POSITIVE;

    if (isA2Null) return ORDER.NEGATIVE;

    return null;
};

export const compareNumber = (
    a1: ICommonComparableCellValue,
    a2: ICommonComparableCellValue,
    type: SortType
) => {
    const isA1Num = typeof a1 === 'number';
    const isA2Num = typeof a2 === 'number';

    if (isA1Num && isA2Num) {
        if (a1 < a2) {
            return type === SortType.ASC ? ORDER.NEGATIVE : ORDER.POSITIVE;
        }
        if (a1 > a2) {
            return type === SortType.ASC ? ORDER.POSITIVE : ORDER.NEGATIVE;
        }
        return ORDER.ZERO;
    }

    if (isA1Num) {
        return type === SortType.ASC ? ORDER.POSITIVE : ORDER.NEGATIVE;
    }

    if (isA2Num) {
        return type === SortType.ASC ? ORDER.NEGATIVE : ORDER.POSITIVE;
    }

    return null;
};

export const compareString = (
    a1: ICommonComparableCellValue,
    a2: ICommonComparableCellValue,
    type: SortType,
    compareText: TextComparer = defaultTextComparer
) => {
    const isA1Str = typeof a1 === 'string';
    const isA2Str = typeof a2 === 'string';

    if (isA1Str) {
        a1 = removeStringSymbol((a1 as string).toLocaleLowerCase()) as string;
    }
    if (isA2Str) {
        a2 = removeStringSymbol((a2 as string).toLocaleLowerCase()) as string;
    }

    if (!isA1Str && !isA2Str) {
        return null;
    }

    if (isA1Str && isA2Str) {
        const order = compareText(a1 as string, a2 as string);
        if (order < 0) {
            return type === SortType.ASC ? ORDER.NEGATIVE : ORDER.POSITIVE;
        }
        if (order > 0) {
            return type === SortType.ASC ? ORDER.POSITIVE : ORDER.NEGATIVE;
        }
        return ORDER.ZERO;
    }

    if (isA1Str) {
        return type === SortType.ASC ? ORDER.POSITIVE : ORDER.NEGATIVE;
    }

    if (isA2Str) {
        return type === SortType.ASC ? ORDER.NEGATIVE : ORDER.POSITIVE;
    }

    return null;
};

export const isNullValue = (cell: Nullable<ICellData>) => {
    if (!cell) {
        return true;
    }
    if (Object.keys(cell).length === 0) {
        return true;
    }
    if (cell?.v == null && cell?.p == null) {
        return true;
    }
    return false;
};
