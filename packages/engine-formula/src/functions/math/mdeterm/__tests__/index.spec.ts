/**
 * Copyright 2023-present DreamNum Inc.
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
import { Mdeterm } from '../index';

describe('Test mdeterm function', () => {
    const testFunction = new Mdeterm(FUNCTION_NAMES_MATH.MDETERM);

    describe('Mdeterm', () => {
        it('Value is normal number', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array);
            expect(getObjectValue(result)).toBe(0);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1.5, 2, 3],
                    [2, 5, 6],
                    [7, 8, 9],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array2);
            expect(getObjectValue(result2)).toBe(-13.5);

            const array3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(array3);
            expect(getObjectValue(result3)).toBe(1);
        });

        it('ArrayRowCount !== arrayColumnCount', () => {
            const array = ArrayValueObject.create({
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
            const result = testFunction.calculate(array);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const array = StringValueObject.create('test');
            const result = testFunction.calculate(array);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const array = BooleanValueObject.create(true);
            const result = testFunction.calculate(array);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
        it('Value is blank cell', () => {
            const array = NullValueObject.create();
            const result = testFunction.calculate(array);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
        it('Value is error', () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(array);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3.4, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });
    });
});
