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

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Csch } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test csch function', () => {
    const textFunction = new Csch(FUNCTION_NAMES_MATH.CSCH);

    describe('Csch', () => {
        it('Value is array', () => {
            const valueArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(valueArray);
            const transformedResult = transformToValue(result.getArrayValue());

            // Format and compare each value individually
            transformedResult.forEach((row, rowIndex) => {
                row.forEach((value, colIndex) => {
                    if (typeof value === 'number' && !isNaN(value)) {
                        // If value is a number, round it to 15 decimal places for comparison
                        transformedResult[rowIndex][colIndex] = Number(value.toFixed(15));
                    }
                });
            });

            const expected = [
                [0.8509181282393216, '#VALUE!', 0.731067071048825, 0.8509181282393216, Infinity],
                [Infinity, 2.688117141816135, 0.12976543732002155, '#VALUE!', -0.10026742064449062],
            ];

            expect(transformedResult).toEqual(expected);
        });
    });
});
