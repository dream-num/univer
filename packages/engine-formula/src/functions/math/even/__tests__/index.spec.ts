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
import { Even } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test even function', () => {
    const testFunction = new Even(FUNCTION_NAMES_MATH.EVEN);

    describe('Even', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(1.5);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(2);
        });

        it('Value is number valid', () => {
            const number = NumberValueObject.create(-1);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(-2);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('3.5');
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(4);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(2);
        });
        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(0);
        });
        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2.15, ' ', 5, -1.575, true, 'test', 1.98, -50.55, 5],
                    [1, true, null, '2', false, -1, 2.5, -3, -2],
                ]),
                rowCount: 2,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [4, ErrorType.VALUE, 6, -2, 2, ErrorType.VALUE, 2, -52, 6],
                [2, 2, 0, 2, 0, -2, 4, -4, -2],
            ]);
        });
    });
});
