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
import { CellValueType, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { getMedianResult } from '../../basics/statistical';
import { RangeReferenceObject } from '../../engine/reference-object/range-reference-object';
import { ArrayValueObject } from '../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { Aggregate } from '../math/aggregate';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { Median } from '../statistical/median';
import { getObjectValue } from '../util';

describe('Finite median midpoints', () => {
    const median = new Median(FUNCTION_NAMES_STATISTICAL.MEDIAN);
    const aggregate = new Aggregate(FUNCTION_NAMES_MATH.AGGREGATE);

    it('keeps finite medians when the two middle values overflow their sum', () => {
        const fixtures: [number[], number][] = [
            [[Number.MAX_VALUE, Number.MAX_VALUE], Number.MAX_VALUE],
            [[-Number.MAX_VALUE, -Number.MAX_VALUE], -Number.MAX_VALUE],
            [[2 ** 1023, 1.5 * 2 ** 1023], 1.25 * 2 ** 1023],
            [[-(2 ** 1023), -1.5 * 2 ** 1023], -1.25 * 2 ** 1023],
            [[0, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], Number.MAX_VALUE],
        ];
        for (const [values, expected] of fixtures) {
            expect(getObjectValue(median.calculate(...values.map((value) => NumberValueObject.create(value))))).toBe(expected);
            expect(getObjectValue(median.calculate(ArrayValueObject.createByArray([values])))).toBe(expected);
        }
    });

    it('computes AGGREGATE median from real cell references', () => {
        for (const sign of [1, -1]) {
            const cellData = new ObjectMatrix<ICellData>();
            for (let row = 0; row < 2; row++) cellData.setValue(row, 0, { v: sign * Number.MAX_VALUE, t: CellValueType.NUMBER });
            const range = new RangeReferenceObject({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }, 'sheet', 'unit');
            range.setUnitData({ unit: { sheet: { rowCount: 2, columnCount: 1, rowData: {}, columnData: {}, cellData } } });
            try {
                expect(getObjectValue(aggregate.calculate(NumberValueObject.create(12), NumberValueObject.create(4), range))).toBe(sign * Number.MAX_VALUE);
            } finally {
                range.dispose();
            }
        }
    });

    it('retains subnormal midpoints, cancellation and ordinary medians', () => {
        const fixtures: [number[], number][] = [
            [[Number.MIN_VALUE, Number.MIN_VALUE], Number.MIN_VALUE],
            [[-Number.MIN_VALUE, -Number.MIN_VALUE], -Number.MIN_VALUE],
            [[Number.MIN_VALUE, 2 * Number.MIN_VALUE], 2 * Number.MIN_VALUE],
            [[-Number.MAX_VALUE, Number.MAX_VALUE], 0],
            [[1, 2, 9, 10], 5.5],
            [[3, Number.MAX_VALUE, 1], 3],
            [[Number.MAX_VALUE], Number.MAX_VALUE],
        ];
        for (const [values, expected] of fixtures) {
            expect(getObjectValue(median.calculate(ArrayValueObject.createByArray([values])))).toBe(expected);
        }
    });

    it('retains non-finite helper results and formula error propagation', () => {
        for (const [values, expected] of [
            [[Infinity, Infinity], Infinity],
            [[-Infinity, -Infinity], -Infinity],
            [[-Infinity, Infinity], NaN],
            [[NaN, 1], NaN],
        ] as const) {
            expect(getObjectValue(getMedianResult([...values]))).toBe(expected);
        }
        expect(getObjectValue(median.calculate(NumberValueObject.create(Number.MAX_VALUE), ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
        expect(getObjectValue(median.calculate(ArrayValueObject.createByArray([[null, true, 'text']])))).toBe(ErrorType.NUM);
    });
});
