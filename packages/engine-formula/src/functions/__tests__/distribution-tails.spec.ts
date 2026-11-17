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
import { ArrayValueObject } from '../../engine/value-object/array-value-object';
import { BooleanValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { Lognormdist } from '../compatibility/lognormdist';
import { Normsdist } from '../compatibility/normsdist';
import { Erfc } from '../engineering/erfc';
import { ErfcPrecise } from '../engineering/erfc-precise';
import { FUNCTION_NAMES_ENGINEERING } from '../engineering/function-names';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { LognormDist } from '../statistical/lognorm-dist';
import { LognormInv } from '../statistical/lognorm-inv';
import { NormDist } from '../statistical/norm-dist';
import { NormInv } from '../statistical/norm-inv';
import { NormSDist } from '../statistical/norm-s-dist';
import { NormSInv } from '../statistical/norm-s-inv';
import { getObjectValue } from '../util';

function expectRelative(actual: number, expected: number) {
    expect(Math.abs(actual / expected - 1)).toBeLessThan(1e-12);
}

describe('Distribution tail formulas', () => {
    // References evaluated with 120-digit mpmath arithmetic.
    const zero = NumberValueObject.create(0);
    const one = NumberValueObject.create(1);
    const cumulative = BooleanValueObject.create(true);

    it('ERFC and ERFC.PRECISE return the complementary tail', () => {
        for (const fn of [new Erfc(FUNCTION_NAMES_ENGINEERING.ERFC), new ErfcPrecise(FUNCTION_NAMES_ENGINEERING.ERFC_PRECISE)]) {
            const result = fn.calculate(NumberValueObject.create(10));
            expectRelative(getObjectValue(result) as number, 2.088487583762545e-45);
        }
    });

    it('ERFC formulas keep normal tails and flush subnormal worksheet results', () => {
        for (const fn of [new Erfc(FUNCTION_NAMES_ENGINEERING.ERFC), new ErfcPrecise(FUNCTION_NAMES_ENGINEERING.ERFC_PRECISE)]) {
            expectRelative(getObjectValue(fn.calculate(NumberValueObject.create(26.54))) as number, 2.6455581744685104e-308);
            for (const x of [26.55, 26.6, 27]) {
                expect(getObjectValue(fn.calculate(NumberValueObject.create(x)))).toBe(0);
                expect(getObjectValue(fn.calculate(NumberValueObject.create(-x)))).toBe(2);
            }
        }
    });

    it('normal CDF formulas retain lower tails through array evaluation', () => {
        const x = ArrayValueObject.createByArray([[-8, -10, -20, -37]]);
        const expected = [6.220960574271784e-16, 7.619853024160525e-24, 2.7536241186062337e-89, 5.725571222524577e-300];
        const results = [
            new NormDist(FUNCTION_NAMES_STATISTICAL.NORM_DIST).calculate(x, zero, one, cumulative),
            new NormSDist(FUNCTION_NAMES_STATISTICAL.NORM_S_DIST).calculate(x, cumulative),
            new Normsdist(FUNCTION_NAMES_COMPATIBILITY.NORMSDIST).calculate(x),
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
            new NormSDist(FUNCTION_NAMES_STATISTICAL.NORM_S_DIST).calculate(x, cumulative),
            new Normsdist(FUNCTION_NAMES_COMPATIBILITY.NORMSDIST).calculate(x),
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

    it('lognormal CDF formulas retain lower tails through array evaluation', () => {
        const x = ArrayValueObject.createByArray([[1e-4, 1e-10]]);
        const expected = [1.6254621050168804e-20, 1.2841756306435309e-117];
        const results = [
            new LognormDist(FUNCTION_NAMES_STATISTICAL.LOGNORM_DIST).calculate(x, zero, one, cumulative),
            new Lognormdist(FUNCTION_NAMES_COMPATIBILITY.LOGNORMDIST).calculate(x, zero, one),
        ];
        for (const result of results) {
            const actual = getObjectValue(result) as number[][];
            for (let i = 0; i < expected.length; i++) expectRelative(actual[0][i], expected[i]);
        }
    });

    it('lognormal CDF formulas flush subnormal results in both aliases', () => {
        const x = ArrayValueObject.createByArray([[Math.exp(-37.5), Math.exp(-37.52), Math.exp(-38)]]);
        const results = [
            new LognormDist(FUNCTION_NAMES_STATISTICAL.LOGNORM_DIST).calculate(x, zero, one, cumulative),
            new Lognormdist(FUNCTION_NAMES_COMPATIBILITY.LOGNORMDIST).calculate(x, zero, one),
        ];
        for (const result of results) {
            const actual = getObjectValue(result) as number[][];
            expectRelative(actual[0][0], 4.605353009581955e-308);
            expect(actual[0].slice(1)).toEqual([0, 0]);
        }
    });

    it('inverse normal and lognormal formulas resolve small probabilities', () => {
        const cases = [
            [1e-20, -9.262340089798407, 9.493291347224349e-5],
            [1e-30, -11.464024688443615, 1.0501161493987006e-5],
            [1e-50, -14.933337534788489, 3.269895790882902e-7],
        ];
        const normal = new NormInv(FUNCTION_NAMES_STATISTICAL.NORM_INV);
        const standard = new NormSInv(FUNCTION_NAMES_STATISTICAL.NORM_S_INV);
        const lognormal = new LognormInv(FUNCTION_NAMES_STATISTICAL.LOGNORM_INV);
        for (const [p, expectedNormal, expectedLognormal] of cases) {
            const probability = NumberValueObject.create(p);
            expect(getObjectValue(normal.calculate(probability, zero, one))).toBeCloseTo(expectedNormal, 12);
            expect(getObjectValue(standard.calculate(probability))).toBeCloseTo(expectedNormal, 12);
            expectRelative(getObjectValue(lognormal.calculate(probability, zero, one)) as number, expectedLognormal);
        }
    });
});
