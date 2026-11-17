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
import { Effect } from '../index';

describe('Test effect function', () => {
    const testFunction = new Effect(FUNCTION_NAMES_FINANCIAL.EFFECT);

    describe('Effect', () => {
        it.each([1, 2, 12, 365])('Preserves zero rounding for small rates with %i periods', (periods) => {
            const result = testFunction.calculate(NumberValueObject.create(1e-20), NumberValueObject.create(periods));
            expect(result.getValue()).toBe(0);
        });

        it.each([1, 12])('Preserves the rounding boundary with %i periods', (periods) => {
            const rounded = testFunction.calculate(NumberValueObject.create(Number.EPSILON / 2), NumberValueObject.create(periods));
            expect(rounded.getValue()).toBe(0);

            const nonzero = testFunction.calculate(NumberValueObject.create(Number.EPSILON), NumberValueObject.create(periods));
            expect(nonzero.getValue()).toBeGreaterThan(0);
        });

        it.each([1, 12])('Preserves zero rounding for a numeric string with %i periods', (periods) => {
            const result = testFunction.calculate(StringValueObject.create('1e-20'), NumberValueObject.create(periods));
            expect(result.getValue()).toBe(0);
        });

        it('Validates arguments before rounding tiny rates', () => {
            const negative = testFunction.calculate(NumberValueObject.create(-1e-20), NumberValueObject.create(1));
            expect(negative.getValue()).toBe(ErrorType.NUM);

            const noPeriods = testFunction.calculate(NumberValueObject.create(1e-20), NumberValueObject.create(0));
            expect(noPeriods.getValue()).toBe(ErrorType.NUM);

            const unboundedPeriods = testFunction.calculate(NumberValueObject.create(1e-20), NumberValueObject.create(Number.POSITIVE_INFINITY));
            expect(unboundedPeriods.getValue()).toBeNaN();
        });

        it('Keeps large period counts and truncates fractional periods', () => {
            const large = testFunction.calculate(NumberValueObject.create(0.05), NumberValueObject.create(1e21));
            expect(large.getValue()).toBeCloseTo(0.05127109637602404, 15);

            const fractional = testFunction.calculate(NumberValueObject.create(0.5), NumberValueObject.create(2.9));
            expect(fractional.getValue()).toBe(0.5625);
        });

        it('Preserves the rate for a single annual period', () => {
            const result = testFunction.calculate(NumberValueObject.create(1e300), NumberValueObject.create(1));
            expect(result.getValue()).toBe(1e300);
        });

        it('Value is normal', () => {
            const nominalRate = NumberValueObject.create(0.0525);
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(nominalRate, npery);
            expect(getObjectValue(result, true)).toBe(0.0535426673708);
        });

        it('Value is error', () => {
            const nominalRate = ErrorValueObject.create(ErrorType.NAME);
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(nominalRate, npery);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const nominalRate = NumberValueObject.create(0.0525);
            const npery = BooleanValueObject.create(true);
            const result = testFunction.calculate(nominalRate, npery);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const nominalRate = NumberValueObject.create(0.0525);
            const npery = NullValueObject.create();
            const result = testFunction.calculate(nominalRate, npery);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const nominalRate = StringValueObject.create('test');
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(nominalRate, npery);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const nominalRate = ArrayValueObject.create({
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
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(nominalRate, npery);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
    });
});
