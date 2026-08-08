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
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Percentof } from '../index';

describe('Test percentof function', () => {
    const testFunction = new Percentof(FUNCTION_NAMES_LOGICAL.PERCENTOF);

    it('returns the Excel-compatible ratio for scalar values', () => {
        const result = testFunction.calculate(
            NumberValueObject.create(185980),
            NumberValueObject.create(229829)
        );

        expect(getObjectValue(result)).toBeCloseTo(0.8092103259379799, 15);
    });

    it('sums ranges before dividing and reports a zero denominator', () => {
        const subset = ArrayValueObject.create({
            calculateValueList: transformToValueObject([[10], [5]]),
            rowCount: 2,
            columnCount: 1,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });
        const all = ArrayValueObject.create({
            calculateValueList: transformToValueObject([[10], [20], [5]]),
            rowCount: 3,
            columnCount: 1,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });

        expect(getObjectValue(testFunction.calculate(subset, all))).toBeCloseTo(15 / 35, 15);
        expect(getObjectValue(testFunction.calculate(subset, NumberValueObject.create(0)))).toBe(ErrorType.DIV_BY_ZERO);
    });
});
