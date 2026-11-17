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

import type { ICellData } from '@univerjs/core';
import { CellValueType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SortType } from '../../services/interface';
import { compareCells, getSortRank, SortRank } from '../utils';

const cell = (v: ICellData['v'], t?: CellValueType): ICellData => ({ v, t });
const ascending = (a: ICellData | null, b: ICellData | null) => compareCells(SortType.ASC, a, b);
const descending = (a: ICellData | null, b: ICellData | null) => compareCells(SortType.DESC, a, b);

describe('getSortRank', () => {
    it('classifies cells into the value kinds Excel sorts by', () => {
        expect(getSortRank(null)).toBe(SortRank.BLANK);
        expect(getSortRank({})).toBe(SortRank.BLANK);
        expect(getSortRank(cell(10, CellValueType.NUMBER))).toBe(SortRank.NUMBER);
        expect(getSortRank(cell('apple', CellValueType.STRING))).toBe(SortRank.TEXT);
        expect(getSortRank(cell('TRUE', CellValueType.BOOLEAN))).toBe(SortRank.LOGICAL);
        expect(getSortRank(cell('#N/A', CellValueType.STRING))).toBe(SortRank.ERROR);
    });

    it('keeps text that only looks like an error or a number in the text kind', () => {
        expect(getSortRank(cell('#N/A', CellValueType.FORCE_STRING))).toBe(SortRank.TEXT);
        expect(getSortRank(cell('002', CellValueType.FORCE_STRING))).toBe(SortRank.TEXT);
    });

    it('falls back to the JavaScript value kind for cells without a type', () => {
        expect(getSortRank({ v: 10 })).toBe(SortRank.NUMBER);
        expect(getSortRank({ v: true })).toBe(SortRank.LOGICAL);
        expect(getSortRank({ v: 'apple' })).toBe(SortRank.TEXT);
    });
});

describe('compareCells', () => {
    it('orders numbers before text, logical values, errors, and blanks', () => {
        const numberCell = cell(10, CellValueType.NUMBER);
        const textCell = cell('apple', CellValueType.STRING);
        const logicalCell = cell(1, CellValueType.BOOLEAN);
        const errorCell = cell('#N/A', CellValueType.STRING);

        expect(ascending(numberCell, textCell)).toBeLessThan(0);
        expect(ascending(textCell, logicalCell)).toBeLessThan(0);
        expect(ascending(logicalCell, errorCell)).toBeLessThan(0);
        expect(descending(numberCell, textCell)).toBeGreaterThan(0);
        expect(descending(errorCell, logicalCell)).toBeLessThan(0);
    });

    it('keeps blanks last in both directions', () => {
        const numberCell = cell(10, CellValueType.NUMBER);
        expect(ascending(numberCell, null)).toBeLessThan(0);
        expect(descending(numberCell, null)).toBeLessThan(0);
    });

    it('decodes every Boolean encoding instead of comparing it as text', () => {
        const trueCell = cell('TRUE', CellValueType.BOOLEAN);
        const falseCell = cell(0, CellValueType.BOOLEAN);
        expect(ascending(falseCell, trueCell)).toBeLessThan(0);
        expect(ascending(trueCell, falseCell)).toBeGreaterThan(0);
        expect(ascending(cell('1', CellValueType.BOOLEAN), trueCell)).toBe(0);
    });

    it('treats all errors as equal so a secondary key decides their order', () => {
        expect(ascending(cell('#N/A', CellValueType.STRING), cell('#DIV/0!', CellValueType.STRING))).toBe(0);
        expect(descending(cell('#N/A', CellValueType.STRING), cell('#DIV/0!', CellValueType.STRING))).toBe(0);
    });

    it('is symmetric for mixed cell kinds', () => {
        const cells = [
            cell(10, CellValueType.NUMBER),
            cell('apple', CellValueType.STRING),
            cell('#N/A', CellValueType.STRING),
            cell('#N/A', CellValueType.FORCE_STRING),
            cell(0, CellValueType.BOOLEAN),
            cell(1, CellValueType.BOOLEAN),
            null,
        ];

        cells.forEach((a) => {
            cells.forEach((b) => {
                expect(Math.sign(ascending(a, b)) + Math.sign(ascending(b, a))).toBe(0);
            });
        });
    });
});
