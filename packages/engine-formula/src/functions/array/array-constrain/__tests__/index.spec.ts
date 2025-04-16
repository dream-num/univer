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
import { FUNCTION_NAMES_ARRAY } from '../../function-names';
import { ArrayConstrain } from '../index';

describe('Test arrayConstrain function', () => {
    const testFunction = new ArrayConstrain(FUNCTION_NAMES_ARRAY.ARRAY_CONSTRAIN);

    describe('ArrayConstrain', () => {
        it('Value is normal', () => {
            const inputRange = ArrayValueObject.create({
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
            const numRows = NumberValueObject.create(2);
            const numCols = NumberValueObject.create(2);
            const result = testFunction.calculate(inputRange, numRows, numCols);
            expect(getObjectValue(result)).toStrictEqual([
                [1, 2],
                [4, 5],
            ]);
        });

        it('InputRange value test', () => {
            const inputRange = ErrorValueObject.create(ErrorType.NAME);
            const numRows = NumberValueObject.create(2);
            const numCols = NumberValueObject.create(2);
            const result = testFunction.calculate(inputRange, numRows, numCols);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const inputRange2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(inputRange2, numRows, numCols);
            expect(getObjectValue(result2)).toBe(1);
        });

        it('NumRows and numCols value test', () => {
            const inputRange = ArrayValueObject.create({
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
            const numRows = NullValueObject.create();
            const numCols = NumberValueObject.create(2);
            const result = testFunction.calculate(inputRange, numRows, numCols);
            expect(getObjectValue(result)).toBe(ErrorType.REF);

            const numRows2 = NumberValueObject.create(-2);
            const result2 = testFunction.calculate(inputRange, numRows2, numCols);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const numRows3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(inputRange, numRows3, numCols);
            expect(getObjectValue(result3)).toStrictEqual([
                [1, 2],
            ]);

            const numRows4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(inputRange, numRows4, numCols);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const numRows5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(inputRange, numRows5, numCols);
            expect(getObjectValue(result5)).toBe(ErrorType.NAME);

            const numRows6 = NumberValueObject.create(222);
            const result6 = testFunction.calculate(inputRange, numRows6, numCols);
            expect(getObjectValue(result6)).toStrictEqual([
                [1, 2],
                [4, 5],
                [7, 8],
            ]);
        });
    });
});
