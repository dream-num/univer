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
import { ErrorType } from '../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_FINANCIAL } from '../financial/function-names';
import { Xirr } from '../financial/xirr';
import { Xnpv } from '../financial/xnpv';

describe('XNPV starting date', () => {
    const calculate = (values: ArrayValueObject, dates: ArrayValueObject) => new Xnpv(FUNCTION_NAMES_FINANCIAL.XNPV).calculate(NumberValueObject.create(0.1), values, dates);
    describe.each([false, true])('column vector: %s', (column) => {
        const array = (values: (number | string)[]) => ArrayValueObject.create({
            calculateValueList: transformToValueObject(column ? values.map((value) => [value]) : [values]),
            rowCount: column ? values.length : 1,
            columnCount: column ? 1 : values.length,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        });

        it.each([
            { dates: [1000, 1365, 999], values: [-100, 121, -10] },
            { dates: [1000, 999, 1365], values: [-100, -10, 121] },
            { dates: [1000.9, 1365.1, 999.99], values: [-100, 121, -10] },
            { dates: [1, 366, 0], values: [-100, 121, -10] },
        ])('rejects a cash flow before the first date: $dates', ({ dates, values }) => {
            expect(calculate(array(values), array(dates)).getValue()).toBe(ErrorType.NUM);
        });

        it.each([
            // Dates after the first payment need not be sorted.
            { dates: [1000, 1730, 1365], values: [-100, 121, 0] },
            { dates: [1000, 1000, 1365], values: [-100, -10, 121] },
            // Truncation makes the first two serials the same payment date.
            { dates: [1000.9, 1000.1, 1365.8], values: [-100, -10, 121] },
        ])('retains valid schedules and date truncation: $dates', ({ dates, values }) => {
            expect(calculate(array(values), array(dates)).getValue()).toBeCloseTo(0, 10);
        });

        it('preserves value and date conversion errors before the schedule check', () => {
            expect(calculate(array([ErrorType.REF, 121, -10]), array([1000, 1365, 999])).getValue()).toBe(ErrorType.REF);
            expect(calculate(array([-100, 121, -10]), array([1000, 'not a date', 999])).getValue()).toBe(ErrorType.VALUE);
        });

        it('retains XIRR support for payments before the starting date', () => {
            // Office explicitly permits this for XIRR (MS-OI29500, 18.17.7.349).
            // With t = 1 + rate, the independent equation is 10*t^2 + 100*t - 121 = 0.
            const result = new Xirr(FUNCTION_NAMES_FINANCIAL.XIRR).calculate(
                array([-100, 121, -10]),
                array([1000, 1365, 635])
            );
            expect(result.getValue()).toBeCloseTo(0.09097693313642422, 9);
        });
    });
});
