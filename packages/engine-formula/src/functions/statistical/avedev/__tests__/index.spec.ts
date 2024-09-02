/**
 * Copyright 2023-present DreamNum Inc.
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
import { Avedev } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test avedev function', () => {
    const testFunction = new Avedev(FUNCTION_NAMES_STATISTICAL.AVEDEV);

    describe('Avedev', () => {
        it('Var1 is number, var2 is number', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = NumberValueObject.create(2);
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(0.5);
        });
        it('Var1 is number, var2 is string', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = StringValueObject.create('test');
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
        it('Var1 is number, var2 is string number', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = StringValueObject.create('2');
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(0.5);
        });
        it('Var1 is number, var2 is boolean', () => {
            const var1 = NumberValueObject.create(2);

            let var2 = BooleanValueObject.create(true);
            let result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(0.5);

            var2 = BooleanValueObject.create(false);
            result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(1);
        });
        it('Var1 is number, var2 is null', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = NullValueObject.create();
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(0);
        });
        it('Var1 is number, var2 is error', () => {
            const var1 = NumberValueObject.create(1);
            const var2 = ErrorValueObject.create(ErrorType.NA);
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(ErrorType.NA);
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
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Var1 is array includes blank cells', () => {
            const var1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    [null],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(var1);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Var1 is number, var2 is array not includes error', () => {
            const var1 = NumberValueObject.create(2);
            const var2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(24.344081632653065);
        });
        it('Var1 is number, var2 is array not includes error, includes 0', () => {
            const var1 = NumberValueObject.create(2);
            const var2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 0, 1.23, true, false, 0],
                    [0, '100', '2.34', 0, -3, 0],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(16.469917355371905);
        });

        it('Var1 is number, var2 is array not includes boolean, includes 0', () => {
            const var1 = NumberValueObject.create(2);
            const var2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 0, 1.23, 0, 0, 0],
                    [0, '100', '2.34', 0, -3, 0],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(var1, var2);
            expect(result.getValue()).toBe(14.158934911242605);
        });
    });
});
