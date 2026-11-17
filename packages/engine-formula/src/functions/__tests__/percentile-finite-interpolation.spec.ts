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
import { ArrayValueObject, transformToValueObject } from '../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { Aggregate } from '../math/aggregate';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { PercentileExc } from '../statistical/percentile-exc';
import { PercentileInc } from '../statistical/percentile-inc';
import { QuartileExc } from '../statistical/quartile-exc';
import { QuartileInc } from '../statistical/quartile-inc';

function createArray(values: number[]) {
    return ArrayValueObject.create({
        calculateValueList: transformToValueObject([values]),
        rowCount: 1,
        columnCount: values.length,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });
}

const functions = [
    { name: 'PERCENTILE.INC', instance: new PercentileInc(FUNCTION_NAMES_STATISTICAL.PERCENTILE_INC), parameter: 0.5, aggregate: 16 },
    { name: 'PERCENTILE.EXC', instance: new PercentileExc(FUNCTION_NAMES_STATISTICAL.PERCENTILE_EXC), parameter: 0.5, aggregate: 18 },
    { name: 'QUARTILE.INC', instance: new QuartileInc(FUNCTION_NAMES_STATISTICAL.QUARTILE_INC), parameter: 2, aggregate: 17 },
    { name: 'QUARTILE.EXC', instance: new QuartileExc(FUNCTION_NAMES_STATISTICAL.QUARTILE_EXC), parameter: 2, aggregate: 19 },
];

describe.each(functions)('$name finite interpolation', ({ instance, parameter, aggregate }) => {
    it('interpolates opposite finite extremes without overflowing their difference', () => {
        const result = instance.calculate(createArray([1e308, -1e308]), NumberValueObject.create(parameter));
        expect(result.getValue()).toBe(0);
    });

    it('also preserves finite results through AGGREGATE', () => {
        const aggregateFunction = new Aggregate(FUNCTION_NAMES_MATH.AGGREGATE);
        const result = aggregateFunction.calculate(
            NumberValueObject.create(aggregate),
            NumberValueObject.create(6),
            createArray([-1e308, 1e308]),
            NumberValueObject.create(parameter)
        );
        expect(result.getValue()).toBe(0);
    });

    it.each([
        { values: [1e308, 1.6e308], expected: 1.3e308 },
        { values: [-1.6e308, -1e308], expected: -1.3e308 },
        { values: [1e308, 1e308], expected: 1e308 },
        { values: [-4, 2], expected: -1 },
        { values: [Number.MIN_VALUE, Number.MIN_VALUE], expected: Number.MIN_VALUE },
    ])('preserves ordinary, same-sign and subnormal interpolation: $values', ({ values, expected }) => {
        const result = instance.calculate(createArray(values), NumberValueObject.create(parameter));
        expect(result.getValue()).toBe(expected);
    });
});

describe('Noncentral percentile interpolation', () => {
    it.each([
        { instance: functions[0].instance, values: [-1.6e308, 1e308], parameter: 0.25, expected: -9.5e307 },
        { instance: functions[0].instance, values: [-1.6e308, 1e308], parameter: 0.75, expected: 3.5e307 },
        { instance: functions[1].instance, values: [-1.6e308, 1e308], parameter: 5 / 12, expected: -9.5e307 },
        { instance: functions[2].instance, values: [-1.6e308, 1e308], parameter: 1, expected: -9.5e307 },
        { instance: functions[3].instance, values: [-1.6e308, 1e308, 1e308, 1e308, 1e308, 1e308], parameter: 1, expected: 3.5e307 },
    ])('keeps a finite weighted result for parameter $parameter', ({ instance, values, parameter, expected }) => {
        const result = instance.calculate(createArray(values), NumberValueObject.create(parameter));
        expect(result.isNumber()).toBe(true);
        expect(Number.isFinite(result.getValue())).toBe(true);
        expect((result.getValue() as number) / expected).toBeCloseTo(1, 14);
    });

    it.each([0, 1])('retains the exact inclusive endpoint at $0', (parameter) => {
        const result = functions[0].instance.calculate(createArray([-1e308, 1e308]), NumberValueObject.create(parameter));
        expect(result.getValue()).toBe(parameter === 0 ? -1e308 : 1e308);
    });
});
