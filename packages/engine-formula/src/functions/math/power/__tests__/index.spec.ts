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
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Power } from '../index';

describe('Test power function', () => {
    const testFunction = new Power(FUNCTION_NAMES_MATH.POWER);

    describe('Power', () => {
        it('Number is single cell, power is single cell', () => {
            const number = NumberValueObject.create(5);
            const power = NumberValueObject.create(2);
            const result = testFunction.calculate(number, power);
            expect(getObjectValue(result)).toBe(25);
        });

        it.each<[number, number, number | ErrorType]>([
            [3.14159265358979, 32, 8105800789910447],
            [2, -0.5, 0.7071067811865475],
            [-2, 0.5, ErrorType.NUM],
            [-8, 1 / 3, -1.9999999999999998],
            [-8, 2 / 3, ErrorType.NUM],
            [1e-100, 3.125, 3.16227766016e-313],
            [1e-100, -3.125, ErrorType.DIV_BY_ZERO],
            [38.89472629697586, -193.5055357939188, 0],
            [10, 126, 1.0000000000000001e126],
            [10, -307, 1.0000000000000001e-307],
            [1.00000000000001, 2147483649, 1.0000214579021443],
            [-1, 4294967294, 1],
            [-1, 4294967295, ErrorType.NUM],
            [-1, 2 ** 53, ErrorType.NUM],
            [1.00000000000001, 2 ** 53, 1.2204032943172858e39],
            [0.5, -1022, 4.49423283715579e307],
            [0.5, -1023, ErrorType.DIV_BY_ZERO],
            [2, -1023, 0],
            [2, 1024, ErrorType.NUM],
            [0.125, 1e308, ErrorType.NUM],
            [0.125, -1e308, 0],
        ])('matches Excel for %s raised to %s', (base, exponent, expected) => {
            const result = testFunction.calculate(NumberValueObject.create(base), NumberValueObject.create(exponent));
            expect(result.getValue()).toBe(expected);
        });

        it('Number is single string number, power is single string number', () => {
            const number = new StringValueObject('5');
            const power = new StringValueObject('2');
            const result = testFunction.calculate(number, power);
            expect(getObjectValue(result)).toBe(25);
        });

        it('Number is single cell, power is array', () => {
            const number = NumberValueObject.create(2);
            const power = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number, power);
            expect(getObjectValue(result, true)).toStrictEqual([
                [2, ErrorType.VALUE, 2.34566989846, 2, 1, 1],
                [1, 1.2676506002282294e+30, 5.06302637588, ErrorType.VALUE, 0.125, ErrorType.VALUE],
            ]);
        });

        it('Number is array, power is single cell', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const power = NumberValueObject.create(2);
            const result = testFunction.calculate(number, power);
            expect(getObjectValue(result, true)).toStrictEqual([
                [1, ErrorType.VALUE, 1.5129, 1, 0, 0],
                [0, 10000, 5.4756, ErrorType.VALUE, 9, ErrorType.VALUE],
            ]);
        });

        it('Number is array, power is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const power = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number, power);
            expect(getObjectValue(result, true)).toStrictEqual([
                [1, ErrorType.VALUE, 1.23, 1, 0, 0],
                [0, 10000, 5.4756, ErrorType.VALUE, 9, ErrorType.VALUE],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('Number is 0', () => {
            const number = NumberValueObject.create(0);
            const power = NumberValueObject.create(2);
            const result = testFunction.calculate(number, power);
            expect(getObjectValue(result)).toBe(0);

            const power2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(number, power2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const power3 = NumberValueObject.create(-1);
            const result3 = testFunction.calculate(number, power3);
            expect(getObjectValue(result3)).toBe(ErrorType.DIV_BY_ZERO);
        });
    });
});
