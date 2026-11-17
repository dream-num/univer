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
import { ArrayValueObject, transformToValueObject } from '../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { Lognormdist } from '../compatibility/lognormdist';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { LognormDist } from '../statistical/lognorm-dist';
import { NormDist } from '../statistical/norm-dist';
import { getObjectValue } from '../util';

const number = (value: number) => NumberValueObject.create(value);

// Reference CDF/PDF values computed with Python math.erfc and math.exp.
const standardValues = [
    { z: -1, cdf: 0.15865525393145707, pdf: 0.24197072451914337 },
    { z: 0, cdf: 0.5, pdf: 0.3989422804014327 },
    { z: 1, cdf: 0.8413447460685429, pdf: 0.24197072451914337 },
];

describe.each([
    { name: 'NORM.DIST', func: new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST), logarithmic: false },
    { name: 'LOGNORM.DIST', func: new LognormDist(FUNCTION_NAMES_STATISTICAL.LOGNORM_DIST), logarithmic: true },
])('$name scale normalization', ({ func, logarithmic }) => {
    describe.each([1e-200, 1e200, 1])('with standard deviation %s', (scale) => {
        it.each(standardValues)('evaluates the CDF at z=$z', ({ z, cdf }) => {
            const x = logarithmic ? 1 : z * scale;
            const mean = logarithmic ? -z * scale : 0;
            const result = func.calculate(number(x), number(mean), number(scale), number(1)).getValue();

            expect(result).toBeCloseTo(cdf, 13);
        });

        it.each(standardValues)('evaluates the PDF at z=$z', ({ z, pdf }) => {
            const x = logarithmic ? 1 : z * scale;
            const mean = logarithmic ? -z * scale : 0;
            const result = func.calculate(number(x), number(mean), number(scale), number(0)).getValue();

            expect(typeof result).toBe('number');
            // A relative check must reject 0 even when the expected PDF is tiny.
            expect((result as number) / (pdf / scale)).toBeCloseTo(1, 12);
        });
    });

    it.each([0, -1])('retains the invalid-scale error for %s', (scale) => {
        expect(func.calculate(number(1), number(0), number(scale), number(1)).getValue()).toBe(ErrorType.NUM);
    });
});

describe('normal distribution overflow and consumers', () => {
    const normal = new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST);

    it.each([
        { x: -1e308, mean: 1e308, cdf: 0.02275013194817922 },
        { x: 1e308, mean: -1e308, cdf: 0.9772498680518208 },
    ])('standardizes opposite-sign finite locations at x=$x', ({ x, mean, cdf }) => {
        const scale = 1e308;
        expect(normal.calculate(number(x), number(mean), number(scale), number(1)).getValue()).toBeCloseTo(cdf, 13);
        const pdf = normal.calculate(number(x), number(mean), number(scale), number(0)).getValue();
        expect((pdf as number) / (0.05399096651318806 / scale)).toBeCloseTo(1, 11);
    });

    it('evaluates array-valued scales and cumulative flags independently', () => {
        const array = (values: number[]) => ArrayValueObject.create({
            calculateValueList: transformToValueObject([values]),
            rowCount: 1,
            columnCount: values.length,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });
        const result = normal.calculate(
            array([-1e-200, 1e200, 0]),
            number(0),
            array([1e-200, 1e200, 1e-200]),
            array([1, 1, 0])
        );
        const values = getObjectValue(result) as number[][];

        expect(values[0][0]).toBeCloseTo(standardValues[0].cdf, 13);
        expect(values[0][1]).toBeCloseTo(standardValues[2].cdf, 13);
        expect(values[0][2] / (standardValues[1].pdf / 1e-200)).toBeCloseTo(1, 12);
    });

    it.each([1e-200, 1e200])('keeps the legacy LOGNORMDIST consumer consistent at scale %s', (scale) => {
        const legacy = new Lognormdist(FUNCTION_NAMES_COMPATIBILITY.LOGNORMDIST);
        const result = legacy.calculate(number(1), number(-scale), number(scale)).getValue();

        expect(result).toBeCloseTo(standardValues[2].cdf, 13);
    });
});
