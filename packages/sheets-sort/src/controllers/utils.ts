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

export const compareString = (a1: ICommonComparableCellValue, a2: ICommonComparableCellValue, type: SortType) => {
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
        const a1AsString = a1 as string;
        const a2AsString = a2 as string;
        if (a1AsString < a2AsString) {
            return type === SortType.ASC ? ORDER.NEGATIVE : ORDER.POSITIVE;
        }
        if (a1AsString > a2AsString) {
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
