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

import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Complex } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test complex function', () => {
    const testFunction = new Complex(FUNCTION_NAMES_ENGINEERING.COMPLEX);

    describe('Complex', () => {
        it('Value is normal number', () => {
            const realNum = NumberValueObject.create(3);
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('i');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toBe('3+4i');

            const iNum2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(realNum, iNum2, suffix);
            expect(result2.getValue()).toBe(3);
        });

        it('Value is number string', () => {
            const realNum = StringValueObject.create('-0.5');
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('i');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toBe('-0.5+4i');
        });

        it('Value is normal string', () => {
            const realNum = StringValueObject.create('test');
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('i');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const realNum = BooleanValueObject.create(true);
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('i');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const realNum = NullValueObject.create();
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('i');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toBe('4i');
        });

        it('Value is error', () => {
            const realNum = ErrorValueObject.create(ErrorType.NAME);
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('i');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Suffix value is not i or j', () => {
            const realNum = NumberValueObject.create(3);
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('test');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const realNum = ArrayValueObject.create({
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
            const iNum = NumberValueObject.create(4);
            const suffix = StringValueObject.create('i');
            const result = testFunction.calculate(realNum, iNum, suffix);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
