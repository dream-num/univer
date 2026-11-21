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

import { Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { ForecastEtsStat } from '../index';

describe('FORECAST.ETS.STAT seasonal coefficient', () => {
    let injector: Injector;
    let testFunction: ForecastEtsStat;

    beforeEach(() => {
        injector = new Injector([
            [ForecastEtsStat, { useFactory: () => injector.createInstance(ForecastEtsStat, FUNCTION_NAMES_STATISTICAL.FORECAST_ETS_STAT) }],
        ]);
        testFunction = injector.get(ForecastEtsStat);
    });

    afterEach(() => injector.dispose());

    it.each([
        { label: 'four-point period limit', values: [1, 2, 3, 4], period: 2, expected: [0.9, 0.001, Number.EPSILON, 0, 0, 0, 0, 1] },
        { label: 'five-point seasonal training', values: [8, 14, 11, 20, 14], period: 2, expected: [0.126, 0.001, 0.001, 0.1917662970357142, 0.07875267266438521, 1.1505977822142852, 1.4238506996915083, 1] },
        { label: 'five-point automatic period', values: [8, 14, 11, 20, 14], period: 1, expected: [0.126, 0.001, 0.001, 0.1917662970357142, 0.07875267266438521, 1.1505977822142852, 1.4238506996915083, 1] },
        { label: 'partial seasonal phases', values: [7, -3, -4, -4, -10, 5, 1, 8, 19], period: 5, expected: [0.251, 0.001, 0.001, 0.7465719014713602, 0.9427699529062844, 5.039360334931682, 6.425254519911797, 1] },
    ])('matches all Excel statistics for $label', ({ values, period, expected }) => {
        expected.forEach((value, metric) => {
            const result = testFunction.calculate(
                ArrayValueObject.create(`{${values.join(',')}}`),
                ArrayValueObject.create(`{${values.map((_, i) => i + 1).join(',')}}`),
                NumberValueObject.create(metric + 1),
                NumberValueObject.create(period)
            ).getValue();
            if (Math.abs(value) < 1e-10) expect(result).toBe(value);
            else expect(result).toBeCloseTo(value, 10);
        });
    });

    it.each([
        { period: 0, expected: Number.EPSILON },
        { period: 2, expected: 0.001 },
    ])('preserves the Excel seasonal coefficient for period $period', ({ period, expected }) => {
        const result = testFunction.calculate(
            ArrayValueObject.create('{7,2,12,1,17,4,13,8}'),
            ArrayValueObject.create('{1,2,3,4,5,6,7,8}'),
            NumberValueObject.create(3),
            NumberValueObject.create(period)
        );
        expect(result.getValue()).toBe(expected);
    });
});
