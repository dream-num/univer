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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { NormSInv } from '../index';

describe('Test normSInv function', () => {
    const testFunction = new NormSInv(FUNCTION_NAMES_STATISTICAL.NORM_S_INV);

    describe('NormSInv', () => {
        it('Value is normal', () => {
            const probability = NumberValueObject.create(0.2069);
            const result = testFunction.calculate(probability);
            expect(getObjectValue(result, true)).toBe(-0.817224751753);
        });

        it('Value is normal string', () => {
            const probability = StringValueObject.create('test');
            const result = testFunction.calculate(probability);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const probability = BooleanValueObject.create(true);
            const result = testFunction.calculate(probability);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is null', () => {
            const probability = NullValueObject.create();
            const result = testFunction.calculate(probability);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const probability = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(probability);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const probability = ArrayValueObject.create({
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
            const result = testFunction.calculate(probability);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);

            const probability2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(probability2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });
    });
});

describe('Distribution tail formulas', () => {
    // References evaluated with 120-digit mpmath arithmetic.
    it('inverse normal and lognormal formulas resolve small probabilities', () => {
        const cases = [
            [1e-20, -9.262340089798407, 9.493291347224349e-5],
            [1e-30, -11.464024688443615, 1.0501161493987006e-5],
            [1e-50, -14.933337534788489, 3.269895790882902e-7],
        ];
        const standard = new NormSInv(FUNCTION_NAMES_STATISTICAL.NORM_S_INV);
        for (const [p, expectedNormal] of cases) {
            const probability = NumberValueObject.create(p);
            expect(getObjectValue(standard.calculate(probability))).toBeCloseTo(expectedNormal, 12);
        }
    });
});
