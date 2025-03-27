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
import { CeilingPrecise } from '../index';

describe('Test ceiling.precise function', () => {
    const testFunction = new CeilingPrecise(FUNCTION_NAMES_MATH.CEILING_PRECISE);

    describe('CeilingPrecise', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(2.15);
            const significance = NumberValueObject.create(1);
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(3);
        });

        it('number < 0 and significance < 0', () => {
            const number = NumberValueObject.create(-2.5);
            const significance = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(-2);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('21.5');
            const significance = StringValueObject.create('1');
            const result = testFunction.calculate(number, significance);
            expect(result.getValue()).toBe(22);
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
            expect(result.getValue()).toBe(3);
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

        it('Value is array', () => {
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
                [3, 0, -0, 0, ErrorType.VALUE, 2.5, -48, 6, ErrorType.NA],
            ]);
        });
    });
});
