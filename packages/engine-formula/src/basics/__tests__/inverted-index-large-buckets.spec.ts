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
import { CellValueType, Injector, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { RangeReferenceObject } from '../../engine/reference-object/range-reference-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { Countif } from '../../functions/statistical/countif';
import { FUNCTION_NAMES_STATISTICAL } from '../../functions/statistical/function-names';
import { getObjectValue } from '../../functions/util';
import { FormulaCacheService } from '../../services/formula-cache.service';
import { InvertedIndexCache } from '../inverted-index-cache';

describe('Large inverted-index zero and empty buckets', () => {
    const count = 200000;

    it.each([0, null])('filters a large %s bucket without exceeding the argument limit', (value) => {
        const cache = new InvertedIndexCache();
        for (let row = 0; row < count; row++) cache.set('unit', 'sheet', 0, value, row);
        const result = cache.getCellPositions('unit', 'sheet', 0, 0, [[10, 12], [count - 2, count - 1]]);
        expect(result).toEqual({ errorType: null, matchingRows: [10, 11, 12, count - 2, count - 1] });
    });

    it('preserves bucket order and disjoint-range filtering', () => {
        const cache = new InvertedIndexCache();
        for (const [row, value] of [[9, null], [3, 0], [1, ''], [8, 0], [5, undefined], [0, 0]] as const) {
            cache.set('unit', 'sheet', 0, value, row);
        }
        expect(cache.getCellPositions('unit', 'sheet', 0, 0, [[0, 3], [8, 9]])).toEqual({
            errorType: null,
            matchingRows: [3, 8, 0, 9, 1],
        });
        expect(cache.getCellPositions('unit', 'sheet', 0, 0, [])).toEqual({ errorType: null, matchingRows: [] });
        expect(cache.getCellPositions('unit', 'sheet', 0, '', [[0, 9]])?.matchingRows).toEqual([9, 1, 5]);
    });

    it('evaluates COUNTIF over a warmed 200,000-row zero range', () => {
        const injector = new Injector([[FormulaCacheService]]);
        const context = injector.get(FormulaCacheService).createCalculation()!;
        const cellData = new ObjectMatrix<ICellData>();
        for (let row = 0; row < count; row++) cellData.setValue(row, 0, { v: 0, t: CellValueType.NUMBER });
        const range = new RangeReferenceObject({ startRow: 0, endRow: count - 1, startColumn: 0, endColumn: 0 }, 'sheet', 'unit');
        range.setUnitData({ unit: { sheet: { rowCount: count, columnCount: 1, rowData: {}, columnData: {}, cellData } } });
        range.setCalculationCache(context);
        const fn = new Countif(FUNCTION_NAMES_STATISTICAL.COUNTIF);
        try {
            expect(getObjectValue(fn.calculate(range, NumberValueObject.create(1)))).toBe(0);
            expect(context.invertedIndex.getCellValuePositions('unit', 'sheet', 0)?.get(0)?.size).toBe(count);
            expect(getObjectValue(fn.calculate(range, NumberValueObject.create(0)))).toBe(count);
        } finally {
            range.dispose();
            injector.dispose();
        }
    });
});
