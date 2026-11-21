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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_COMPATIBILITY } from '../../../compatibility/function-names';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { NormDist } from '../index';

describe('Test normDist function', () => {
    const testFunction = new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST);

    describe('NormDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.989324657288);
        });

        it('StandardDev value test', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(0);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.00705370772379);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.105649773667);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toBe(0.0668072012689);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(15.2069);
            const mean2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, mean2, standardDev, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const standardDev2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(x2, mean, standardDev2, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(x2, mean, standardDev, cumulative2);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.105649773667, ErrorType.VALUE, 0.116532625373, 0.105649773667, 0.0668072012689, 0.0668072012689],
                [0.0668072012689, 1, 0.180095815063, ErrorType.VALUE, 0.012224472655, ErrorType.NAME],
            ]);
        });
    });
});

describe('Distribution tail formulas', () => {
    // References evaluated with 120-digit mpmath arithmetic.
    const zero = NumberValueObject.create(0);
    const one = NumberValueObject.create(1);
    const cumulative = BooleanValueObject.create(true);
    function expectRelative(actual: number, expected: number) {
        expect(Math.abs(actual / expected - 1)).toBeLessThan(1e-12);
    }

    it('normal CDF formulas retain lower tails through array evaluation', () => {
        const x = ArrayValueObject.createByArray([[-8, -10, -20, -37]]);
        const expected = [6.220960574271784e-16, 7.619853024160525e-24, 2.7536241186062337e-89, 5.725571222524577e-300];
        const results = [
            new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST).calculate(x, zero, one, cumulative),
        ];
        for (const result of results) {
            const actual = getObjectValue(result) as number[][];
            for (let i = 0; i < expected.length; i++) expectRelative(actual[0][i], expected[i]);
        }
    });

    it('normal CDF formulas flush only final results below the normal boundary', () => {
        const x = ArrayValueObject.createByArray([[-37.5, -37.51, -37.52, -38]]);
        const results = [
            new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST).calculate(x, zero, one, cumulative),
            new NormDist(FUNCTION_NAMES_COMPATIBILITY.NORMDIST).calculate(x, zero, one, cumulative),
        ];
        for (const result of results) {
            const actual = getObjectValue(result) as number[][];
            expectRelative(actual[0][0], 4.605353009581955e-308);
            expectRelative(actual[0][1], 3.1642088986155016e-308);
            expect(actual[0].slice(2)).toEqual([0, 0]);
        }
    });

    it('preserves normal density results after scaling a small tail', () => {
        const result = new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST).calculate(
            NumberValueObject.create(38e-150),
            zero,
            NumberValueObject.create(1e-150),
            BooleanValueObject.create(false)
        );
        expectRelative(getObjectValue(result) as number, 1.0972210520075816e-164);
    });
});
