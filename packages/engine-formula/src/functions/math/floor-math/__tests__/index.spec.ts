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
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { FloorMath } from '../index';

describe('Test floor.math function', () => {
    const testFunction = new FloorMath(FUNCTION_NAMES_MATH.FLOOR_MATH);

    describe('FloorMath', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(2.15);
            const significance = NumberValueObject.create(1);
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(2);
        });

        it('number < 0 and significance < 0 and mode is null', () => {
            const number = NumberValueObject.create(-2.5);
            const significance = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(-4);
        });

        it('number < 0 and significance < 0 and mode is not null or 0', () => {
            const number = NumberValueObject.create(-2.5);
            const significance = NumberValueObject.create(-2);
            const mode = NumberValueObject.create(22);
            const result = testFunction.calculate(number, significance, mode);
            expect(result.getValue()).toBe(-2);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const significance = NumberValueObject.create(1);
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = NumberValueObject.create(2.15);
            const significance = BooleanValueObject.create(true);
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(2);
        });

        it('Value is blank cell', () => {
            const number = NumberValueObject.create(2.15);
            const significance = NullValueObject.create();
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(0);
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const significance = NumberValueObject.create(1);
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('number and significance is array, mode is null or 0', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2.15, null, -1.575, '21.5', 'test', 1.98, '-50.55', 5],
                ]),
                rowCount: 1,
                columnCount: 8,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const significance = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, true, 2, false, -1, 2.5, -3, -2, ' '],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number, significance);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [2, 0, -2, 0, ErrorType.VALUE, 0, -51, 4, ErrorType.NA],
            ]);
        });

        it('number and significance is array, mode is not null or 0', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2.15, null, -1.575, '21.5', 'test', 1.98, '-50.55', 5],
                ]),
                rowCount: 1,
                columnCount: 8,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const significance = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, true, 2, false, -1, 2.5, -3, -2, ' '],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const mode = NumberValueObject.create(-23);
            const result = testFunction.calculate(number, significance, mode);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [2, 0, -0, 0, ErrorType.VALUE, 0, -48, 4, ErrorType.NA],
            ]);
        });
    });
});
