/**
 * Copyright 2023-present DreamNum Inc.
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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Xnpv } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test xnpv function', () => {
    const testFunction = new Xnpv(FUNCTION_NAMES_FINANCIAL.XNPV);

    describe('Xnpv', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(1994.5100406532624);
        });

        it('Value is normal, but no positive and negative number', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is normal, but values.length !== dates.length', () => {
            const rate = NumberValueObject.create(0.1);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const rate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const values = ArrayValueObject.create('{-10000,2750,4250,3250,2750}');
            const dates = ArrayValueObject.create('{39448,39508,39751,39859,39904}');
            const result = testFunction.calculate(rate, values, dates);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
