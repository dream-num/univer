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
import { Rate } from '../index';

describe('Test rate function', () => {
    const testFunction = new Rate(FUNCTION_NAMES_FINANCIAL.RATE);

    describe('Rate', () => {
        it('Value is normal', () => {
            const nper = NumberValueObject.create(4 * 12);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(getObjectValue(result, true)).toBe(-0.0726317700766);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(nper, pmt, pv, fv, type2, guess);
            expect(getObjectValue(result2, true)).toBe(-0.074590133411);
        });

        it('Value is error', () => {
            const nper = ErrorValueObject.create(ErrorType.NAME);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const nper = BooleanValueObject.create(true);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(getObjectValue(result, true)).toBe(-0.998);
        });

        it('Value is blank cell', () => {
            const nper = NullValueObject.create();
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const nper = StringValueObject.create('test');
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
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
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(getObjectValue(result, true)).toStrictEqual([
                [ErrorType.VALUE, 39.931181756, ErrorType.NUM, ErrorType.NA],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });

        // New tests for all-positive or all-negative cash flows
        it('Returns #NUM! when all cash flows have the same positive sign', () => {
            const result = testFunction.calculate(
                NumberValueObject.create(12),
                NumberValueObject.create(100),
                NumberValueObject.create(1000),
                NumberValueObject.create(100)
            );
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Returns #NUM! when all cash flows have the same negative sign', () => {
            const result = testFunction.calculate(
                NumberValueObject.create(12),
                NumberValueObject.create(-100),
                NumberValueObject.create(-1000),
                NumberValueObject.create(-100)
            );
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Calculates rate correctly with mixed signs', () => {
            const result = testFunction.calculate(
                NumberValueObject.create(48),
                NumberValueObject.create(0),
                NumberValueObject.create(-8000),
                NumberValueObject.create(9000)
            );
            expect(typeof getObjectValue(result)).toBe('number');
        });

        // Edge cases for growth-only / zero-guess-
        it('Correctly calculates long-term growth-only rate even with zero guess', () => {
            const result = testFunction.calculate(
                NumberValueObject.create(90),
                NumberValueObject.create(0),
                NumberValueObject.create(-1000),
                NumberValueObject.create(7_500_000),
                NumberValueObject.create(0),
                NumberValueObject.create(0) // zero guess
            );
            expect(getObjectValue(result, true)).toBeCloseTo(0.10422, 5);
        });

        it('Rejects invalid sign convention with PMT=0', () => {
            const result = testFunction.calculate(
                NumberValueObject.create(90),
                NumberValueObject.create(0),
                NumberValueObject.create(1000),
                NumberValueObject.create(7_500_000)
            );
            expect(getObjectValue(result)).toBe(ErrorType.NUM); // PV and FV same sign
        });

        // Test type parameter boolean conversion: non-zero values should be treated as 1, only 0 as 0
        it('Converts type parameter using standard boolean conversion (non-zero = 1, zero = 0)', () => {
            const nper = NumberValueObject.create(48);
            const pmt = NumberValueObject.create(-1000);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);

            // type = 0 should give one result
            const result0 = testFunction.calculate(nper, pmt, pv, fv, NumberValueObject.create(0), guess);
            const value0 = getObjectValue(result0, true) as number;

            // type = 1 should give a different result
            const result1 = testFunction.calculate(nper, pmt, pv, fv, NumberValueObject.create(1), guess);
            const value1 = getObjectValue(result1, true) as number;

            // Verify 0 and 1 produce different results
            expect(value0).not.toBe(value1);

            // Non-zero values (0.2, -1, 0.49) should be treated as 1 (true)
            const result02 = testFunction.calculate(nper, pmt, pv, fv, NumberValueObject.create(0.2), guess);
            const resultNeg1 = testFunction.calculate(nper, pmt, pv, fv, NumberValueObject.create(-1), guess);
            const result049 = testFunction.calculate(nper, pmt, pv, fv, NumberValueObject.create(0.49), guess);

            // All non-zero values should match type=1, not type=0
            expect(getObjectValue(result02, true)).toBe(value1);
            expect(getObjectValue(resultNeg1, true)).toBe(value1);
            expect(getObjectValue(result049, true)).toBe(value1);

            // Verify they don't match type=0
            expect(getObjectValue(result02, true)).not.toBe(value0);
            expect(getObjectValue(resultNeg1, true)).not.toBe(value0);
            expect(getObjectValue(result049, true)).not.toBe(value0);
        });
    });
});
