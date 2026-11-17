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
import { Correl } from '../statistical/correl';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { Pearson } from '../statistical/pearson';
import { Rsq } from '../statistical/rsq';

function array(values: number[]): ArrayValueObject {
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

describe.each([
    { name: 'CORREL', func: new Correl(FUNCTION_NAMES_STATISTICAL.CORREL), squared: false },
    { name: 'PEARSON', func: new Pearson(FUNCTION_NAMES_STATISTICAL.PEARSON), squared: false },
    { name: 'RSQ', func: new Rsq(FUNCTION_NAMES_STATISTICAL.RSQ), squared: true },
])('$name normalization', ({ func, squared }) => {
    describe.each([
        [1e150, 1e150],
        [1e-150, 1e-150],
        [1e100, 1e100],
        [1e-100, 1e-100],
        [1e150, 1e-150],
        [1, 1],
    ])('with scales %s and %s', (scaleX, scaleY) => {
        it.each([
            { values: [-3, -1, 1, 3], correlation: 1 },
            { values: [3, 1, -1, -3], correlation: -1 },
            // The centered dot product is 16 and both squared norms are 20.
            { values: [-3, 1, -1, 3], correlation: 0.8 },
        ])('preserves correlation $correlation', ({ values, correlation }) => {
            const x = array([-3, -1, 1, 3].map((value) => value * scaleX));
            const y = array(values.map((value) => value * scaleY));

            const result = func.calculate(x, y).getValue();

            expect(typeof result).toBe('number');
            expect(result).toBeCloseTo(squared ? correlation ** 2 : correlation, 13);
        });
    });

    it.each([1e150, 1e-150, 1])('retains the zero-variance error at scale %s', (scale) => {
        const x = array([scale, scale, scale, scale]);
        const y = array([-3, -1, 1, 3].map((value) => value * scale));

        expect(func.calculate(x, y).getValue()).toBe(ErrorType.DIV_BY_ZERO);
    });
});
