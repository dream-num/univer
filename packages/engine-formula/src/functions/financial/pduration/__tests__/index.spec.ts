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
import { Pduration } from '../index';

describe('Test pduration function', () => {
    const testFunction = new Pduration(FUNCTION_NAMES_FINANCIAL.PDURATION);

    describe('Pduration', () => {
        it.each([1e-15, 1])('Preserves Excel zero periods when logarithms coincide: rate=%s', (rate) => {
            const result = testFunction.calculate(
                NumberValueObject.create(rate),
                NumberValueObject.create(1e15),
                NumberValueObject.create(1e15 + 1)
            );
            expect(result.getValue()).toBe(0);
        });

        it.each([-0.5, -0.01, 0])('Rejects nonpositive rates: %s', (rate) => {
            const result = testFunction.calculate(NumberValueObject.create(rate), NumberValueObject.create(1000), NumberValueObject.create(1200));
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Preserves small positive rates', () => {
            const rate = NumberValueObject.create(1e-20);
            const present = NumberValueObject.create(1);
            const result = testFunction.calculate(rate, present, NumberValueObject.create(2));
            expect(Number(result.getValue()) / 6.931471805599453e19).toBeCloseTo(1, 14);
            expect(testFunction.calculate(rate, present, present).getValue()).toBe(0);
        });

        it('Preserves zero periods when nearby large values have the same logarithm', () => {
            const rate = 2 ** -50;
            const present = 2 ** 1000;
            const result = testFunction.calculate(
                NumberValueObject.create(rate),
                NumberValueObject.create(present),
                NumberValueObject.create(present * (1 + rate))
            );
            expect(result.getValue()).toBe(0);
        });

        it.each([
            [1e-300, 1e300, 1993.1568569324174],
            [1e300, 1e-300, -1993.1568569324174],
        ])('Keeps widely separated positive values finite', (present, future, expected) => {
            const result = testFunction.calculate(NumberValueObject.create(1), NumberValueObject.create(present), NumberValueObject.create(future));
            expect(result.getValue()).toBeCloseTo(expected, 10);
        });

        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.025 / 12);
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(getObjectValue(result, true)).toBe(87.6054764194);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(getObjectValue(result, true)).toBe(0.263034405834);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
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
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(getObjectValue(result, true)).toStrictEqual([
                [ErrorType.VALUE, 3.12896813522, ErrorType.NUM],
                [0.263034405834, ErrorType.NUM, ErrorType.NAME],
                [ErrorType.NUM, 0.227333162548, 0.0395052645166],
            ]);
        });
    });
});
