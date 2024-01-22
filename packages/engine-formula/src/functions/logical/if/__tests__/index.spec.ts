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

import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { If } from '..';
import { ArrayValueObject, BooleanValueObject, NumberValueObject } from '../../../..';
import { transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test if function', () => {
    const textFunction = new If(FUNCTION_NAMES_LOGICAL.IF);

    describe('If', () => {
        it('LogicalTest and valueIfTrue', async () => {
            const logicTest = new BooleanValueObject(true);
            const valueIfTrue = new NumberValueObject(1);
            const result = await textFunction.calculate(logicTest, valueIfTrue);
            expect(result.getValue()).toBe(1);
        });

        it('LogicalTest and valueIfTrue and valueIfFalse', async () => {
            const logicTest = new BooleanValueObject(false);
            const valueIfTrue = new NumberValueObject(1);
            const valueIfFalse = new NumberValueObject(2);
            const result = await textFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(result.getValue()).toBe(2);
        });

        it('LogicalTest is array', async () => {
            const logicTest = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfTrue = new NumberValueObject(1);
            const result = await textFunction.calculate(logicTest, valueIfTrue);
            expect(result.getValue()).toBe(1);
        });

        it('LogicalTest is array and valueIfTrue is array', async () => {
            const logicTest = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfTrue = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = await textFunction.calculate(logicTest, valueIfTrue);
            expect(result.getValue()).toBe(1);
        });

        it('LogicalTest is array and valueIfTrue is array and valueIfFalse is array', async () => {
            const logicTest = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [false],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfTrue = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfFalse = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [2],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = await textFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(result.getValue()).toBe(2);
        });
    });
});
