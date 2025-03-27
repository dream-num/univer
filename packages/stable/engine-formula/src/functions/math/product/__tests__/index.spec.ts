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
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Product } from '../index';

describe('Test product function', () => {
    const testFunction = new Product(FUNCTION_NAMES_MATH.PRODUCT);

    describe('Product', () => {
        it('Var1 is number, var2 is number', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = NumberValueObject.create(2);
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(2);
        });
        it('Var1 is string number, var2 is string number', () => {
            const var1 = new StringValueObject('1');
            const var2 = new StringValueObject('2');
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(2);
        });
        it('Var1 is number, var2 is string', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = StringValueObject.create('test');
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
        it('Var1 is number, var2 is string number', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = StringValueObject.create('2');
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(2);
        });
        it('Var1 is number, var2 is boolean', () => {
            const var1 = NumberValueObject.create(2);

            let var2 = BooleanValueObject.create(true);
            let result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(2);

            var2 = BooleanValueObject.create(false);
            result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(0);
        });
        it('Var1 is number, var2 is null', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = NullValueObject.create();
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(1);
        });
        it('Var1 is number, var2 is error', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = ErrorValueObject.create(ErrorType.NA);
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
        });

        it('Var1 is number, var2 is array includes error', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null],
                    [0, ErrorType.VALUE],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Var1 is number, var2 is array not includes error', () => {
            const var1 = NumberValueObject.create(2);
            const var2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [null, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(var1, var2);
            expect(getObjectValue(result)).toBe(-1726.92);
        });

        it('More test', () => {
            const var1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, false],
                    ['test', null],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(var1);
            expect(getObjectValue(result)).toBe(0);

            const var2 = StringValueObject.create('4');
            const result2 = testFunction.calculate(var1, var2);
            expect(getObjectValue(result2)).toBe(4);

            const var3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(var2, var3);
            expect(getObjectValue(result3)).toBe(4);

            const var4 = BooleanValueObject.create(false);
            const result4 = testFunction.calculate(var2, var4);
            expect(getObjectValue(result4)).toBe(0);

            const var5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(var2, var5);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);
        });
    });
});
