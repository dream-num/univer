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
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Dollarfr } from '../index';

describe('Test dollarfr function', () => {
    const testFunction = new Dollarfr(FUNCTION_NAMES_FINANCIAL.DOLLARFR);

    describe('Dollarfr', () => {
        it.each([
            [1e-7, 16, 1.6e-8],
            [-1e-7, 16, -1.6e-8],
            [1e21, 16, 1e21],
            [1e308, 16, 1e308],
            [1.5, 1e21, 1.5],
            [1.125, 1.6e21, 1.02],
            [1.125, 1000000000000001, 1.1250000000000002],
            [1.5, 1e100, 1.5],
            [1.125, 16, 1.02],
            [1.125, 32, 1.04],
            [1.125, 16.75, 1.02],
            [-1.125, 16, -1.02],
            [0, 16, 0],
        ])('converts %s with denominator %s using the existing arithmetic', (amount, fraction, expected) => {
            const result = testFunction.calculate(NumberValueObject.create(amount), NumberValueObject.create(fraction));
            expect(result.getValue()).toBe(expected);
        });

        it('Preserves the power-of-ten boundary for numeric strings', () => {
            const result = testFunction.calculate(StringValueObject.create('1.125'), StringValueObject.create('1000000000000001'));
            expect(result.getValue()).toBe(1.1250000000000002);
        });

        it.each([
            [Number.POSITIVE_INFINITY, 16],
            [1.5, Number.POSITIVE_INFINITY],
        ])('Preserves nonfinite input handling (%s, %s)', (amount, fraction) => {
            const result = testFunction.calculate(NumberValueObject.create(amount), NumberValueObject.create(fraction));
            expect(result.getValue()).toBeNaN();
        });

        it('Value is normal', () => {
            const fractionalDollar = NumberValueObject.create(1.02);
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(1.0032);
        });

        it('Fraction value test', () => {
            const fractionalDollar = NumberValueObject.create(1.02);
            let fraction = NumberValueObject.create(-1);
            let result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            fraction = NumberValueObject.create(0.1);
            result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.DIV_BY_ZERO);
        });

        it('Value is error', () => {
            const fractionalDollar = ErrorValueObject.create(ErrorType.NAME);
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const fractionalDollar = NumberValueObject.create(1.02);
            const fraction = BooleanValueObject.create(true);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const fractionalDollar = StringValueObject.create('test');
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const fractionalDollar = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
