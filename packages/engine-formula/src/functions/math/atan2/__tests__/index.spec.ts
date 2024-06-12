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
import { Atan2 } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test atan2 function', () => {
    const textFunction = new Atan2(FUNCTION_NAMES_MATH.ATAN2);

    describe('Atan2', () => {
        it('Value is normal', () => {
            const value1 = NumberValueObject.create(1);
            const value2 = NumberValueObject.create(1);
            const result = textFunction.calculate(value1, value2);
            expect(result.getValue()).toBeCloseTo(0.7853981633974483);
        });

        it('Value is string number', () => {
            const value1 = new StringValueObject('1');
            const value2 = new StringValueObject('1');
            const result = textFunction.calculate(value1, value2);
            expect(result.getValue()).toBeCloseTo(0.7853981633974483);
        });

        it('Value is array', () => {
            const valueArray1 = ArrayValueObject.create({
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

            const valueArray2 = ArrayValueObject.create({
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

            const result = textFunction.calculate(valueArray1, valueArray2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.7853981633974483, '#VALUE!', 0.7853981633974483, 0.7853981633974483, '#VALUE!'],
                ['#VALUE!', 0.009999666686665238, 0.7853981633974483, '#VALUE!', -2.356194490192345]]);
        });
    });
});
