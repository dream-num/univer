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

import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { ArrayValueObject } from '../../engine/value-object/array-value-object';
import { BooleanValueObject } from '../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { Growth } from '../statistical/growth';
import { Linest } from '../statistical/linest';
import { Logest } from '../statistical/logest';
import { Trend } from '../statistical/trend';
import { getObjectValue } from '../util';

function array(values: number[], column: boolean) {
    return ArrayValueObject.createByArray(column ? values.map((value) => [value]) : [values]);
}

describe('Single-predictor regression with large offsets', () => {
    const linest = new Linest(FUNCTION_NAMES_STATISTICAL.LINEST);
    const trend = new Trend(FUNCTION_NAMES_STATISTICAL.TREND);
    const logest = new Logest(FUNCTION_NAMES_STATISTICAL.LOGEST);
    const growth = new Growth(FUNCTION_NAMES_STATISTICAL.GROWTH);

    it('retains slope and intercept under translation of the predictor', () => {
        for (const offset of [1e9, -1e9, 2 ** 40]) {
            for (const column of [false, true]) {
                const xs = array([offset, offset + 1, offset + 2, offset + 3], column);
                const ys = array([7, 9, 11, 13], column);
                expect(getObjectValue(linest.calculate(ys, xs))).toEqual([[2, 7 - 2 * offset]]);
            }
        }
    });

    it('predicts new values with row and column input arrays', () => {
        const offset = 1e9;
        for (const column of [false, true]) {
            const xs = array([offset, offset + 1, offset + 2, offset + 3], column);
            const ys = array([7, 9, 11, 13], column);
            const newXs = array([offset - 1, offset + 4], column);
            expect(getObjectValue(trend.calculate(ys, xs, newXs))).toEqual(column ? [[5], [15]] : [[5, 15]]);
        }
    });

    it('returns consistent LINEST statistics for a translated exact line', () => {
        const offset = 1e9;
        const xs = array([offset, offset + 1, offset + 2, offset + 3], false);
        const ys = array([7, 9, 11, 13], false);
        const result = getObjectValue(linest.calculate(ys, xs, BooleanValueObject.create(true), BooleanValueObject.create(true))) as number[][];
        expect(result[0]).toEqual([2, 7 - 2 * offset]);
        expect(result[1]).toEqual([0, 0]);
        expect(result[2]).toEqual([1, 0]);
        expect(result[3][1]).toBe(2);
        expect(result[4]).toEqual([20, 0]);
    });

    it('fits constant exponential responses with large predictor offsets', () => {
        const offset = 1e9;
        for (const column of [false, true]) {
            const xs = array([offset, offset + 1, offset + 2, offset + 3], column);
            const ys = array([1, 1, 1, 1], column);
            const newXs = array([offset - 1, offset + 4], column);
            expect(getObjectValue(logest.calculate(ys, xs))).toEqual([[1, 1]]);
            expect(getObjectValue(growth.calculate(ys, xs, newXs))).toEqual(column ? [[1], [1]] : [[1, 1]]);
        }
    });

    it('retains the error for a constant predictor with an intercept', () => {
        const xs = array([2 ** 40, 2 ** 40, 2 ** 40], false);
        const ys = array([1, 1, 1], false);
        for (const fn of [linest, logest]) expect(getObjectValue(fn.calculate(ys, xs))).toBe(ErrorType.NA);
        expect(getObjectValue(trend.calculate(ys, xs, xs))).toBe(ErrorType.NA);
        expect(getObjectValue(growth.calculate(ys, xs, xs))).toEqual([[ErrorType.NUM, ErrorType.NUM, ErrorType.NUM]]);
    });
});
