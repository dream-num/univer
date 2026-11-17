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

const isAsciiDigit = (unit: string) => unit >= '0' && unit <= '9';

/** A text split into the units it sorts by, with each unit's class worked out once. */
interface IPreparedText {
    readonly units: readonly string[];
    readonly classes: readonly UnitClass[];
}

// Excel ignores case, hyphens and apostrophes when it sorts text.
const normalizeText = (text: string) => text.toLocaleLowerCase().replace(/-/g, '').replace(/'/g, '');

const prepareText = (text: string): IPreparedText => {
    const units = normalizeText(text).match(TEXT_UNITS) ?? [];
    return { units, classes: units.map(unitClass) };
};

const compareUnits = (a: IPreparedText, b: IPreparedText, collator: Intl.Collator) => {
    const length = Math.min(a.units.length, b.units.length);

    for (let i = 0; i < length; i++) {
        const unitA = a.units[i];
        const unitB = b.units[i];

        // Identical units are equal in every class, and shared prefixes are common in a sort.
        if (unitA === unitB) continue;

        const classA = a.classes[i];
        const classB = b.classes[i];

        if (classA !== classB) return classA - classB;

        const order = classA === UnitClass.SYMBOL
            ? symbolRank(unitA) - symbolRank(unitB) || (unitA < unitB ? -1 : 1)
            : classA === UnitClass.DIGIT && isAsciiDigit(unitA) && isAsciiDigit(unitB)
                // ASCII digits collate by value in every locale, and a digit unit is one character.
                ? unitA.charCodeAt(0) - unitB.charCodeAt(0)
                : collator.compare(unitA, unitB);

        if (order !== 0) return order;
    }

    return a.units.length - b.units.length;
};

// Bounds the prepared texts a comparer keeps if a sort is larger than this.
const MAX_PREPARED_TEXTS = 200_000;

/**
 * Compares text in Excel's order, ignoring case, hyphens and apostrophes: runs of letters by the
 * locale's collation, so an accented letter sorts beside its base letter, and digits before
 * spaces and punctuation before letters. Accents only break ties between texts that are
 * otherwise equal.
 *
 * A sort compares each text many times, so each text is normalized and split once and kept
 * until the current task ends; the comparer holds no texts between sorts.
 */
export const createTextComparer = (locale?: string): TextComparer => {
    const baseCollator = new Intl.Collator(locale, { sensitivity: 'base' });
    const accentCollator = new Intl.Collator(locale, { sensitivity: 'accent' });
    const prepared = new Map<string, IPreparedText>();
    let releaseScheduled = false;

    const prepare = (text: string): IPreparedText => {
        let entry = prepared.get(text);

        if (entry === undefined) {
            if (prepared.size >= MAX_PREPARED_TEXTS) prepared.clear();
            entry = prepareText(text);
            prepared.set(text, entry);

            if (!releaseScheduled) {
                releaseScheduled = true;
                queueMicrotask(() => {
                    prepared.clear();
                    releaseScheduled = false;
                });
            }
        }

        return entry;
    };

    return (a, b) => {
        if (a === b) return 0;

        const preparedA = prepare(a);
        const preparedB = prepare(b);

        return compareUnits(preparedA, preparedB, baseCollator) || compareUnits(preparedA, preparedB, accentCollator);
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

/**
 * Compare two cells the same way Excel sorts a range: by value kind first, then by value inside the
 * kind. Blank cells are always sorted last, whichever direction is used. Text is compared with
 * `compareText`, which defaults to Excel's order in the runtime's default locale.
 */
export function compareCells(
    type: SortType,
    a: SortableCell,
    b: SortableCell,
    compareText: TextComparer = defaultTextComparer
): number {
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
