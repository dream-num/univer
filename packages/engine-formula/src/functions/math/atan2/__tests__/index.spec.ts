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

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Atan2 } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test atan2 function', () => {
    const testFunction = new Atan2(FUNCTION_NAMES_MATH.ATAN2);

    describe('Atan2', () => {
        it('Value is normal number', () => {
            const xNum = NumberValueObject.create(1);
            const yNum = NumberValueObject.create(2);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(1.1071487177940904);
        });
        it('Value is normal number 2', () => {
            const xNum = NumberValueObject.create(8);
            const yNum = NumberValueObject.create(9);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(0.844153986113171);
        });

        it('Value is number valid', () => {
            const xNum = NumberValueObject.create(-2);
            const yNum = NumberValueObject.create(-3);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(-2.1587989303424644);
        });

        it('Value is number string', () => {
            const xNum = StringValueObject.create('0.5');
            const yNum = NumberValueObject.create(2);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(1.3258176636680326);
        });

        it('Value is normal string', () => {
            const xNum = StringValueObject.create('test');
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const xNum = BooleanValueObject.create(false);
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(1.5707963267948966);
        });
        it('Value is blank cell', () => {
            const xNum = NullValueObject.create();
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(1.5707963267948966);
        });
        it('Value is error', () => {
            const xNum = ErrorValueObject.create(ErrorType.NAME);
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });
        it('Result is error', () => {
            const xNum = NumberValueObject.create(0);
            const yNum = NumberValueObject.create(0);
            const result = testFunction.calculate(xNum, yNum);
            expect(result.getValue()).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Value is array and number', () => {
            const xNum = ArrayValueObject.create({
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
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.7853981633974483, ErrorType.VALUE, 0.682622552417217, 0.7853981633974483, 1.5707963267948966, 1.5707963267948966], [1.5707963267948966, 0.009999666686665238, 0.40385979490737667, ErrorType.VALUE, 2.819842099193151, ErrorType.NAME]]);
        });
        it('Value is array and array', () => {
            const xNum = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const yNum = ArrayValueObject.create({
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
            const result = testFunction.calculate(xNum, yNum);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.7853981633974483, ErrorType.VALUE, 0.8881737743776796, 0.7853981633974483, 0, 0], [0, 1.550798992821746, 0.8635794970038352, ErrorType.VALUE, -0.982793723247329, ErrorType.NAME], [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA]]);
        });
    });
});
