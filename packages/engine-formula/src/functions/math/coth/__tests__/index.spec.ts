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
import { Coth } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test coth function', () => {
    const textFunction = new Coth(FUNCTION_NAMES_MATH.COTH);

    describe('Coth', () => {
        it('Value is normal', () => {
            const value = NumberValueObject.create(1);
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(1.3130352854993315, 10);
        });

        it('Value is string number', () => {
            const value = new StringValueObject('1');
            const result = textFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(1.3130352854993315, 10);
        });

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
            expect(transformToValue(result.getArrayValue()).map((row) => row.map((value) => typeof value === 'number' ? Number(value.toFixed(15)) : value))).toStrictEqual([
                [1.3130352854993315, '#VALUE!', 1.1734894743034103, 1.3130352854993315, Infinity],
                [Infinity, 1.000033333333466, 1.020319516942427, '#VALUE!', -0.34657359027997264],
            ].map((row) => row.map((value) => typeof value === 'number' ? Number(value.toFixed(15)) : value)));
        });
    });
});
