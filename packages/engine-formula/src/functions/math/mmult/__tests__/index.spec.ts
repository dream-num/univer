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
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Mmult } from '../index';

describe('Test mmult function', () => {
    const testFunction = new Mmult(FUNCTION_NAMES_MATH.MMULT);

    describe('Mmult', () => {
        it('Value is normal number', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [4, 5],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [4, 5, 6],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toStrictEqual([
                [9, 12, 15],
                [24, 33, 42],
            ]);
        });

        it('Array1ColumnCount !== array2RowCount', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [4, 5],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const array1 = StringValueObject.create('test');
            const array2 = NumberValueObject.create(1);
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const array1 = BooleanValueObject.create(true);
            const array2 = NumberValueObject.create(1);
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
        it('Value is blank cell', () => {
            const array1 = NullValueObject.create();
            const array2 = NumberValueObject.create(1);
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
        it('Value is error', () => {
            const array1 = ErrorValueObject.create(ErrorType.NAME);
            const array2 = NumberValueObject.create(1);
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const array3 = NumberValueObject.create(1);
            const array4 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(array3, array4);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });
    });
});
