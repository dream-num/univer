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

import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Countblank } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test countblank function', () => {
    const testFunction = new Countblank(FUNCTION_NAMES_STATISTICAL.COUNTBLANK);

    describe('Countblank', () => {
        it('Range is error', () => {
            const range = ErrorValueObject.create(ErrorType.REF);
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(ErrorType.REF);
        });
        it('Range is number', () => {
            const range = NumberValueObject.create(1);
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(0);
        });
        it('Range is string', () => {
            const range = StringValueObject.create('test');
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(0);
        });
        it('Range is string, blank string', () => {
            const range = StringValueObject.create('');
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(1);
        });
        it('Range is boolean', () => {
            const range = BooleanValueObject.create(true);
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(0);
        });
        it('Range is null', () => {
            const range = NullValueObject.create();
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(1);
        });

        it('Range is array', () => {
            const range = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, '', null],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE, null],
                ]),
                rowCount: 2,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(3);
        });

        it('Range is array with ref', () => {
            const range = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.REF],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(range);
            expect(result.getValue()).toBe(0);
        });
    });
});
