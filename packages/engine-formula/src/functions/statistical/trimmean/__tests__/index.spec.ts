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
import { Trimmean } from '../index';

describe('Test trimmean function', () => {
    const testFunction = new Trimmean(FUNCTION_NAMES_STATISTICAL.TRIMMEAN);

    describe('Trimmean', () => {
        it('Value is normal', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 2, 3, 4, 5, 6, 7, 8, 9],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const percent = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, percent);
            expect(getObjectValue(result)).toStrictEqual(6);
        });

        it('Array value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null, true, false, 'test', 6, 7, 8, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const percent = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, percent);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, true, false, 'test'],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array2, percent);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NUM);
        });

        it('Percent value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 2, 3, 4, 5, 6, 7, 8, 9],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const percent = NumberValueObject.create(0.1);
            const result = testFunction.calculate(array, percent);
            expect(getObjectValue(result)).toStrictEqual(6.111111111111111);

            const percent2 = NumberValueObject.create(11);
            const result2 = testFunction.calculate(array, percent2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NUM);

            const percent3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(array, percent3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NUM);

            const percent4 = NullValueObject.create();
            const result4 = testFunction.calculate(array, percent4);
            expect(getObjectValue(result4)).toStrictEqual(6.111111111111111);

            const percent5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(array, percent5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);

            const percent6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(array, percent6);
            expect(getObjectValue(result6)).toStrictEqual(ErrorType.NAME);

            const percent7 = ArrayValueObject.create('{0.1,0.2,0.3}');
            const result7 = testFunction.calculate(array, percent7);
            expect(getObjectValue(result7)).toStrictEqual([
                [6.111111111111111, 6.111111111111111, 6],
            ]);

            const percent8 = ArrayValueObject.create('{0.9}');
            const result8 = testFunction.calculate(array, percent8);
            expect(getObjectValue(result8)).toStrictEqual(6);
        });
    });
});
