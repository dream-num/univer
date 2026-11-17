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
import type { ErrorType } from '@univerjs/engine-formula';
import { CellValueType } from '@univerjs/core';
import { ERROR_TYPE_SET } from '@univerjs/engine-formula';
import { getCellValue } from '@univerjs/sheets';
import { SortType } from '../services/interface';

/**
 * Sort order of the value kinds recognized by range sorting. The order matches Excel's default
 * ascending order: numbers, text, logical values, errors, and blank cells.
 */
export enum SortRank {
    NUMBER,
    TEXT,
    LOGICAL,
    ERROR,
    BLANK,
}

type SortableCell = Nullable<ICellData>;

const HASH_CHAR_CODE = 35; // '#'

const removeStringSymbol = (str: string) => str.replace(/-/gi, '').replace(/'/gi, '');

export const isNullValue = (cell: Nullable<ICellData>) => !cell || (cell.v == null && cell.p == null);

/**
 * Get the value kind of a cell. The kind decides the group the cell is sorted in, so it must not
 * depend on the stringified value: a `TRUE` Boolean cell is a logical value, not the text "TRUE".
 */
export function getSortRank(cell: SortableCell): SortRank {
    if (!cell) {
        return SortRank.BLANK;
    }

    const value = cell.v;
    const paragraph = cell.p;
    if (value == null) {
        return paragraph?.body?.dataStream ? SortRank.TEXT : SortRank.BLANK;
    }
    if (paragraph?.body?.dataStream) {
        return SortRank.TEXT;
    }

    switch (cell.t) {
        case CellValueType.NUMBER:
            return getNumberRank(value);
        case CellValueType.STRING:
            return getStringRank(value);
        case CellValueType.BOOLEAN:
            return SortRank.LOGICAL;
        case CellValueType.FORCE_STRING:
            return value === '' ? SortRank.BLANK : SortRank.TEXT;
        default:
            return getUntypedCellRank(value);
    }
}

function getNumberRank(value: ICellData['v']): SortRank {
    if (typeof value !== 'number') {
        return Number.isNaN(Number.parseFloat(`${value}`)) ? SortRank.TEXT : SortRank.NUMBER;
    }
    return Number.isNaN(value) ? SortRank.TEXT : SortRank.NUMBER;
}

function getStringRank(value: ICellData['v']): SortRank {
    if (typeof value === 'number') {
        return SortRank.NUMBER;
    }
    if (value === '') {
        return SortRank.BLANK;
    }
    // Every error token starts with '#', which keeps the set lookup off the common path.
    if (typeof value === 'string' && value.charCodeAt(0) === HASH_CHAR_CODE && ERROR_TYPE_SET.has(value as ErrorType)) {
        return SortRank.ERROR;
    }
    return SortRank.TEXT;
}

function getUntypedCellRank(value: ICellData['v']): SortRank {
    if (typeof value === 'number') {
        return Number.isNaN(value) ? SortRank.TEXT : SortRank.NUMBER;
    }
    if (typeof value === 'boolean') {
        return SortRank.LOGICAL;
    }
    if (value === '') {
        return SortRank.BLANK;
    }
    return SortRank.TEXT;
}

function readNumber(cell: SortableCell): number {
    const value = cell?.v;
    return typeof value === 'number' ? value : Number.parseFloat(`${value}`);
}

function readText(cell: SortableCell): string {
    const richText = cell?.p?.body?.dataStream;
    if (richText) {
        return richText;
    }
    const value = cell?.v;
    return typeof value === 'string' ? value : `${value}`;
}

function readLogical(cell: SortableCell): number {
    const value = cell?.v;
    // Fast path for the encodings the editor writes, which are the overwhelming majority.
    if (value === 1 || value === true) {
        return 1;
    }
    if (value === 0 || value === false) {
        return 0;
    }
    // `getCellValue` decodes the remaining encodings the rest of the codebase accepts, including
    // case-insensitive 'TRUE'/'FALSE' strings and numeric strings such as '1' or '1.0'.
    return cell ? Number(getCellValue(CellValueType.BOOLEAN, cell)) : 0;
}

function compareText(a: string, b: string): number {
    const left = removeStringSymbol(a.toLocaleLowerCase());
    const right = removeStringSymbol(b.toLocaleLowerCase());
    if (left < right) {
        return -1;
    }
    if (left > right) {
        return 1;
    }
    return 0;
}

/**
 * Compare two cells the same way Excel sorts a range: by value kind first, then by value inside the
 * kind. Blank cells are always sorted last, whichever direction is used.
 */
export function compareCells(type: SortType, a: SortableCell, b: SortableCell): number {
    const rankA = getSortRank(a);
    const rankB = getSortRank(b);

    if (rankA === SortRank.BLANK || rankB === SortRank.BLANK) {
        if (rankA === rankB) {
            return 0;
        }
        return rankA === SortRank.BLANK ? 1 : -1;
    }

    const direction = type === SortType.ASC ? 1 : -1;

    if (rankA !== rankB) {
        return direction * (rankA - rankB);
    }

    switch (rankA) {
        case SortRank.NUMBER:
            return direction * Math.sign(readNumber(a) - readNumber(b));
        case SortRank.LOGICAL:
            return direction * Math.sign(readLogical(a) - readLogical(b));
        case SortRank.ERROR:
            // Excel treats every error value as equal, so a secondary sort key decides their order.
            return 0;
        default:
            return direction * compareText(readText(a), readText(b));
    }
}
