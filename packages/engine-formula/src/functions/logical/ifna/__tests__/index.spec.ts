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
import { Ifna } from '../index';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test ifna function', () => {
    const textFunction = new Ifna(FUNCTION_NAMES_LOGICAL.IFNA);

    describe('Ifna', () => {
        it('Value is normal', () => {
            const value = NumberValueObject.create(1);
            const valueIfNa = StringValueObject.create('error');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(1);
        });

        it('Value is #N/A error', () => {
            const value = ErrorValueObject.create(ErrorType.NA);
            const valueIfNa = StringValueObject.create('error');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe('error');
        });

        it('Value is other error', () => {
            const value = ErrorValueObject.create(ErrorType.NAME);
            const valueIfNa = StringValueObject.create('error');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    ['#N/A'],
                    [1],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfNa = StringValueObject.create('error');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is array and valueIfNa is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    ['#N/A'],
                    ['#N/A'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfNa = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a1', 'a2', 'a3'],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Mixed array with different dimensions', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['#N/A', 2, 3],
                    [4, '#N/A', 6],
                    [7, 8, '#N/A'],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfNa = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a', 'b', 'c'],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});
