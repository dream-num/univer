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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { PoissonDist } from '../index';

describe('Test poissonDist function', () => {
    const testFunction = new PoissonDist(FUNCTION_NAMES_STATISTICAL.POISSON_DIST);

    describe('PoissonDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(2);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.124652019483);
        });

        it('X and mean value test', () => {
            const x = NumberValueObject.create(-2);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const x2 = NumberValueObject.create(2);
            const mean2 = NumberValueObject.create(-5);
            const result2 = testFunction.calculate(x2, mean2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const x = NumberValueObject.create(2);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.0842243374886);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.0404276819945);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(0.00673794699909);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(2);
            const mean2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, mean2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(x2, mean, cumulative2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const mean = NumberValueObject.create(5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.0404276819945, ErrorType.VALUE, 0.0404276819945, 0.0404276819945, 0.00673794699909, 0.00673794699909],
                [0.00673794699909, 1, 0.124652019483, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const x = NumberValueObject.create(17.16017);
            const mean = NumberValueObject.create(0.1);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, mean, cumulative);
            expect(getObjectValue(result, true)).toBe(2.54391172294e-32);

            const mean2 = NumberValueObject.create(2);
            const result2 = testFunction.calculate(x, mean2, cumulative);
            expect(getObjectValue(result2, true)).toBe(4.98715018952e-11);

            const x2 = NumberValueObject.create(0.25);
            const mean3 = NumberValueObject.create(0);
            const result3 = testFunction.calculate(x2, mean3, cumulative);
            expect(getObjectValue(result3)).toBe(1);

            const x3 = NumberValueObject.create(139.7316);
            const mean4 = NumberValueObject.create(161);
            const result4 = testFunction.calculate(x3, mean4, cumulative);
            expect(getObjectValue(result4, true)).toBe(0.00698880992304);
        });
    });
});
