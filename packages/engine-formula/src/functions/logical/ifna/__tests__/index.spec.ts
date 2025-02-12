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
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(1);
        });

        it('Value is #N/A error', () => {
            const value = ErrorValueObject.create(ErrorType.NA);
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe('N/A');
        });

        it('Value is another error type', () => {
            const value = ErrorValueObject.create(ErrorType.VALUE);
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is array with #N/A error', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    ['#N/A'],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfNa = StringValueObject.create('N/A');
            const result = textFunction.calculate(value, valueIfNa);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1],
                ['N/A'],
                [3],
            ]);
        });

        it('Value is array and valueIfNa is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '#N/A', 3],
                    ['#N/A', 5, '#N/A'],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfNa = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a1', 'a2', 'a3'],
                    ['b1', 'b2', 'b3'],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(value, valueIfNa);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1, 'a2', 3],
                ['b1', 5, 'b3'],
            ]);
        });
    });
});
