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
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Rri } from '../index';

describe('Test rri function', () => {
    const testFunction = new Rri(FUNCTION_NAMES_FINANCIAL.RRI);

    describe('Rri', () => {
        // Expected rates use (fv / pv) ** (1 / nper) - 1 with 90-digit decimal arithmetic.
        it.each([
            [100, 10000, 10000.000001, 1.000000338486256e-12],
            [1e12, 1, 2, 6.931471805601855e-13],
            [1000, 1e-300, 1e300, 2.9810717055349727],
            [1000, 1e300, 1e-300, -0.748811356849042],
            [100, -10000, -10000.000001, 1.000000338486256e-12],
            [96, 10000, 11000, 0.0009933073762913949],
            [2, 4, 1, -0.5],
        ])('retains finite rates for periods=%s, present=%s, future=%s', (nper, pv, fv, expected) => {
            const result = testFunction.calculate(NumberValueObject.create(nper), NumberValueObject.create(pv), NumberValueObject.create(fv));
            expect(result.isNumber()).toBe(true);
            expect(+result.getValue() / expected).toBeCloseTo(1, 12);
        });

        it.each([
            [1, 1e-300, 1e300, ErrorType.NUM],
            [1000, 1e300, -1e-300, ErrorType.NUM],
            [1000, -1e300, 1e-300, ErrorType.NUM],
            [2, 0, 0, 0],
            [2, 1, 0, -1],
            [2, -1, 0, -1],
            [2, 0, 1, ErrorType.NUM],
            [2, 1, 1, 0],
        ])('preserves valid zero cases and rejects invalid rates (%s, %s, %s)', (nper, pv, fv, expected) => {
            const result = testFunction.calculate(NumberValueObject.create(nper as number), NumberValueObject.create(pv as number), NumberValueObject.create(fv as number));
            expect(result.getValue()).toBe(expected);
        });

        it('Value is normal', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result, true)).toBe(0.000993307376291);
        });

        it('Nper <= 0', () => {
            const nper = NumberValueObject.create(-96);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Pv === 0 && fv === 0', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(0);
            const fv = NumberValueObject.create(0);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Only pv === 0', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(0);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Fv / pv < 0', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(-10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const nper = ErrorValueObject.create(ErrorType.NAME);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const nper = BooleanValueObject.create(true);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result, true)).toBe(0.1);
        });

        it('Value is blank cell', () => {
            const nper = NullValueObject.create();
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const nper = StringValueObject.create('test');
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const nper = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test', 0.06, false],
                    [true, null, ErrorType.NAME],
                    [-22, '1.23', 100],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const pv = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [10],
                    [false],
                    [null],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const fv = NumberValueObject.create(0);
            const result = testFunction.calculate(nper, pv, fv);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.VALUE, -1, ErrorType.NUM],
                [-1, ErrorType.NUM, ErrorType.NAME],
                [ErrorType.NUM, 0, 0],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});
