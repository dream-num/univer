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
import { ModeMult } from '../index';

describe('Test modeMult function', () => {
    const testFunction = new ModeMult(FUNCTION_NAMES_STATISTICAL.MODE_MULT);

    describe('ModeMult', () => {
        it('Value is normal', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [2, 3, 4],
                    [4, 5, 6],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual([
                [2],
                [3],
                [4],
            ]);

            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 8],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual(8);
        });

        it('Value is single cell = null/boolean/string/error/negtive number', () => {
            const number = NumberValueObject.create(3);
            const number2 = NullValueObject.create();
            const number3 = BooleanValueObject.create(true);
            const number4 = StringValueObject.create('test');
            const number5 = ErrorValueObject.create(ErrorType.NAME);
            const number6 = NumberValueObject.create(-3);
            const result = testFunction.calculate(number, number2, number3, number4);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const result2 = testFunction.calculate(number, number2, number3, number5);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const result3 = testFunction.calculate(number, number2, number3, number6);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NA);
        });

        it('Value is not has number', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, false, null, 'test', null, null],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NA);
        });

        it('More test', () => {
            const number = ArrayValueObject.create({
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
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
        });
    });
});
