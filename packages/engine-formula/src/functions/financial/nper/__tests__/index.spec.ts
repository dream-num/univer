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
import { Nper } from '../index';

describe('Test nper function', () => {
    const testFunction = new Nper(FUNCTION_NAMES_FINANCIAL.NPER);

    describe('Nper', () => {
        // Expected periods use the annuity equation evaluated with 90-digit decimal arithmetic.
        it.each([
            [1e-18, -10, 1000, 0, 0, 100],
            [-1e-18, -10, 1000, 0, 0, 100],
            [1e-10, -10, 1000, 500, 0, 150.0000003825],
            [1e-10, -10, 1000, 500, 1, 150.0000003675],
            [-1e-10, -10, 1000, 500, 1, 149.9999996325],
            [1e-18, 0, 1000, -1100, 0, 9.531017980432485e16],
            [1e-8, -100, -1000, 10000, 0, 89.99995095003305],
            [0.01, -100, -1000, 10000, 1, 59.673865674294625],
        ])('retains periods for rate=%s, payment=%s, present=%s, future=%s, type=%s', (rate, pmt, pv, fv, type, expected) => {
            const result = testFunction.calculate(
                NumberValueObject.create(rate),
                NumberValueObject.create(pmt),
                NumberValueObject.create(pv),
                NumberValueObject.create(fv),
                NumberValueObject.create(type)
            );

            expect(result.isNumber()).toBe(true);
            expect(+result.getValue() / expected).toBeCloseTo(1, 12);
        });

        it.each([
            [0, -10, 1000, 500, 150],
            [0, 0, 1000, 0, ErrorType.DIV_BY_ZERO],
            [-2, -10, 1000, 0, ErrorType.NUM],
            [0.01, 0, 1000, 1000, ErrorType.NUM],
            [0.01, -10, 1000, 0, ErrorType.NUM],
        ])('keeps zero-rate and invalid annuity behavior (%s, %s, %s, %s)', (rate, pmt, pv, fv, expected) => {
            const result = testFunction.calculate(
                NumberValueObject.create(rate as number),
                NumberValueObject.create(pmt as number),
                NumberValueObject.create(pv as number),
                NumberValueObject.create(fv as number)
            );
            expect(result.getValue()).toBe(expected);
        });

        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.12 / 12);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result, true)).toBe(60.0821228538);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(rate, pmt, pv, fv, type2);
            expect(getObjectValue(result2, true)).toBe(59.6738656743);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result, true)).toBe(3.19877986411);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result)).toBe(90);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const rate = ArrayValueObject.create({
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
            const pmt = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, -200, false, null],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result, true)).toStrictEqual([
                [ErrorType.VALUE, 18.7698432848, ErrorType.DIV_BY_ZERO, ErrorType.NA],
                [3.32452780635, 45, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, 2.52968015473, 0.498921985805, ErrorType.NA],
            ]);
        });
    });
});
