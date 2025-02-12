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

import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { Type } from '../index';
import { ErrorType } from '../../../../basics/error-type';

describe('Test type function', () => {
    const testFunction = new Type(FUNCTION_NAMES_INFORMATION.TYPE);

    describe('Type', () => {
        it('value is number', () => {
            const value = NumberValueObject.create(123);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(1);
        });

        it('value is number string', () => {
            const value = StringValueObject.create('123');
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(2);
        });

        it('value is string', () => {
            const value = StringValueObject.create('test');
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(2);
        });

        it('value is boolean', () => {
            const value = BooleanValueObject.create(false);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(4);
        });

        it('value is blank cell', () => {
            const value = NullValueObject.create();
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(1);
        });

        it('value is error', () => {
            const value = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(16);
        });

        it('value is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null],
                    [true, 'test'],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(64);
        });
    });
});
