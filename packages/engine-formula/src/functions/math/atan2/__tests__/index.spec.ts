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
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Atan2 } from '../index';

describe('Test atan2 function', () => {
    const testFunction = new Atan2(FUNCTION_NAMES_MATH.ATAN2);

    describe('Atan2', () => {
        it('Value is normal number', () => {
            const xNum = NumberValueObject.create(1);
            const yNum = NumberValueObject.create(2);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result, true)).toBe(1.10714871779);
        });

        it('Value is normal number 2', () => {
            const xNum = NumberValueObject.create(8);
            const yNum = NumberValueObject.create(9);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result, true)).toBe(0.844153986113);
        });

        it('Value is number valid', () => {
            const xNum = NumberValueObject.create(-2);
            const yNum = NumberValueObject.create(-3);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result, true)).toBe(-2.15879893034);
        });

        it('Value is number string', () => {
            const xNum = StringValueObject.create('0.5');
            const yNum = NumberValueObject.create(2);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result, true)).toBe(1.32581766367);
        });

        it('Value is normal string', () => {
            const xNum = StringValueObject.create('test');
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const xNum = BooleanValueObject.create(false);
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result, true)).toBe(1.57079632679);
        });

        it('Value is blank cell', () => {
            const xNum = NullValueObject.create();
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result, true)).toBe(1.57079632679);
        });

        it('Value is error', () => {
            const xNum = ErrorValueObject.create(ErrorType.NAME);
            const yNum = NumberValueObject.create(1);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Result is error', () => {
            const xNum = NumberValueObject.create(0);
            const yNum = NumberValueObject.create(0);
            const result = testFunction.calculate(xNum, yNum);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
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
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.785398163397, ErrorType.VALUE, 0.682622552417, 0.785398163397, 1.57079632679, 1.57079632679],
                [1.57079632679, 0.00999966668667, 0.403859794907, ErrorType.VALUE, 2.81984209919, ErrorType.NAME],
            ]);
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
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.785398163397, ErrorType.VALUE, 0.888173774378, 0.785398163397, 0, 0],
                [0, 1.55079899282, 0.863579497004, ErrorType.VALUE, -0.982793723247, ErrorType.NAME],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});
