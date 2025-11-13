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
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sumproduct } from '../index';

describe('Test sumproduct function', () => {
    const testFunction = new Sumproduct(FUNCTION_NAMES_MATH.SUMPRODUCT);

    describe('Sumproduct', () => {
        it('Array1 is array, not includes error', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1), StringValueObject.create('2'), NumberValueObject.create(3)],
                    [NullValueObject.create(), StringValueObject.create('test'), NumberValueObject.create(2)],
                    [BooleanValueObject.create(true), StringValueObject.create(' '), BooleanValueObject.create(false)],
                ],
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1);
            expect(getObjectValue(result)).toBe(6);
        });

        it('Array1 is array, includes error', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', ErrorType.NUM],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Array1 is array, other variants has same dimension', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1), StringValueObject.create('2'), NumberValueObject.create(3)],
                    [NullValueObject.create(), StringValueObject.create('test'), NumberValueObject.create(2)],
                    [BooleanValueObject.create(true), StringValueObject.create(' '), BooleanValueObject.create(false)],
                ],
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1), NumberValueObject.create(1), NumberValueObject.create(1)],
                    [NullValueObject.create(), StringValueObject.create('test'), NumberValueObject.create(2)],
                    [BooleanValueObject.create(true), NumberValueObject.create(1), BooleanValueObject.create(false)],
                ],
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(8);
        });

        it('Array1 is array, other variants is not same dimension', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', 2],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 1, 1],
                    [true, 1, false],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('More test', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(2)],
                    [NumberValueObject.create(1.570796327)],
                    [NumberValueObject.create(1.316957897)],
                    [NumberValueObject.create(1.570796327)],
                    [NumberValueObject.create(0.168236118)],
                    [NumberValueObject.create(57)],
                    [NumberValueObject.create(0)],
                    [NumberValueObject.create(2.99822295)],
                    [NumberValueObject.create(0.785398163)],
                    [NumberValueObject.create(0.643501109)],
                    [NumberValueObject.create(0.100335348)],
                    [StringValueObject.create('0000001111')],
                    [NumberValueObject.create(3)],
                    [NumberValueObject.create(-6)],
                    [NumberValueObject.create(6)],
                    [NumberValueObject.create(28)],
                    [NumberValueObject.create(36)],
                    [NumberValueObject.create(0.540302306)],
                    [NumberValueObject.create(27.30823284)],
                    [NumberValueObject.create(-0.156119952)],
                ],
                rowCount: 20,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: [
                    [NumberValueObject.create(1.037314721)],
                    [NumberValueObject.create(1.537780562)],
                    [NumberValueObject.create(0.469642441)],
                    [NumberValueObject.create(255)],
                    [NumberValueObject.create(180)],
                    [NumberValueObject.create(2)],
                    [NumberValueObject.create(7.389056099)],
                    [NumberValueObject.create(120)],
                    [NumberValueObject.create(48)],
                    [NumberValueObject.create(2)],
                    [NumberValueObject.create(-4)],
                    [NumberValueObject.create(-4)],
                    [NumberValueObject.create(1)],
                    [NumberValueObject.create(8)],
                    [NumberValueObject.create(10)],
                    [NullValueObject.create()],
                    [NumberValueObject.create(3)],
                    [NumberValueObject.create(3)],
                    [NumberValueObject.create(5)],
                    [NumberValueObject.create(1)],
                ],
                rowCount: 20,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(getObjectValue(result, true)).toBe(1209.32171126296);
        });
    });
});
