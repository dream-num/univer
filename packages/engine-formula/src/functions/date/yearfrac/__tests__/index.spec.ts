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

import { DateSystem, Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Yearfrac } from '../index';

describe('Test yearfrac function', () => {
    let injector: Injector;
    let testFunction: Yearfrac;

    beforeEach(() => {
        injector = new Injector([
            [Yearfrac, { useFactory: () => injector.createInstance(Yearfrac, FUNCTION_NAMES_DATE.YEARFRAC) }],
        ]);
        testFunction = injector.get(Yearfrac);
    });

    afterEach(() => injector.dispose());

    describe('Yearfrac', () => {
        it.each([
            [44985, 45016, 0, 31 / 360],
            [43890, 45351, 1, 1461 / 365.4],
            [36525, 36526, 1, 1 / 365],
            [59, 60, 0, -1 / 360],
            [60, 61, 4, 2 / 360],
        ])('matches Excel dates %s through %s on basis %s', (start, end, basis, expected) => {
            expect(testFunction.calculate(NumberValueObject.create(start), NumberValueObject.create(end), NumberValueObject.create(basis)).getValue()).toBeCloseTo(expected, 12);
        });

        it('value is normal', () => {
            const startDate = StringValueObject.create('2012/2/2');
            const endDate = StringValueObject.create('2021/3/11');

            let result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(9.108333333333333);

            const basis = NumberValueObject.create(1);
            result = testFunction.calculate(startDate, endDate, basis);
            expect(result.getValue()).toStrictEqual(9.102107856556255);
        });

        it('uses the configured date system for numeric serials', () => {
            const startDate = NumberValueObject.create(0);
            const endDate = NumberValueObject.create(365);
            const basis = NumberValueObject.create(1);

            testFunction.setDateSystem(DateSystem.Date1900);
            expect(testFunction.calculate(startDate, endDate, basis).getValue()).toBe(1);

            testFunction.setDateSystem(DateSystem.Date1904);
            expect(testFunction.calculate(startDate, endDate, basis).getValue()).toBeCloseTo(0.9972677596, 10);

            testFunction.setDateSystem(DateSystem.Date1900);
        });

        it('matches Excel basis 0 for February month-end dates', () => {
            const startDate = NumberValueObject.create(44620);
            const endDate = NumberValueObject.create(44985);

            const result = testFunction.calculate(startDate, endDate);

            expect(result.getValue()).toStrictEqual(1);
        });

        it('does not apply the February month-end rule to non-February start dates', () => {
            const startDate = NumberValueObject.create(44804);
            const endDate = NumberValueObject.create(44985);

            const result = testFunction.calculate(startDate, endDate);

            expect(result.getValue()).toBeCloseTo(0.494444444444444, 15);
        });

        it('value is normal, endDate < startDate', () => {
            const startDate = StringValueObject.create('2021/3/11');
            const endDate = StringValueObject.create('2012/2/2');

            let result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(9.108333333333333);

            const basis = NumberValueObject.create(1);
            result = testFunction.calculate(startDate, endDate, basis);
            expect(result.getValue()).toStrictEqual(9.102107856556255);
        });

        it('value is error', () => {
            const startDate = NumberValueObject.create(1);
            const endDate = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('value is boolean', () => {
            const startDate = BooleanValueObject.create(false);
            const endDate = NumberValueObject.create(43832.233);

            let result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const basis = BooleanValueObject.create(true);
            result = testFunction.calculate(startDate, endDate, basis);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('value is normal string', () => {
            const startDate = StringValueObject.create('test');
            const endDate = StringValueObject.create('2021-12-31');
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('value is array', () => {
            const startDate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-3-29', 'test', true, false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const endDate = StringValueObject.create('2021-12-31');
            const result = testFunction.calculate(startDate, endDate) as ArrayValueObject;
            const [row] = transformToValue(result.getArrayValue());
            expect(row[0]).toBeCloseTo(9.755555555555556, 12);
            expect(row.slice(1)).toEqual([ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME]);
        });
        it('checks the serial-zero boundary in both date systems', () => {
            const startDate = NumberValueObject.create(0);
            const endDate = NumberValueObject.create(366);
            const basis = NumberValueObject.create(1);

            testFunction.setDateSystem(DateSystem.Date1900);
            expect(testFunction.calculate(startDate, endDate, basis).getValue()).toBe(1.0027397260273974);

            testFunction.setDateSystem(DateSystem.Date1904);
            expect(testFunction.calculate(startDate, endDate, basis).getValue()).toBe(1);

            testFunction.setDateSystem(DateSystem.Date1900);
        });
    });
});
