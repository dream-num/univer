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

import { DateSystem } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Weeknum } from '../index';

describe('Test weeknum function', () => {
    const testFunction = new Weeknum(FUNCTION_NAMES_DATE.WEEKNUM);

    describe('Weeknum', () => {
        it('Value is all normal', () => {
            const serialNumber = NumberValueObject.create(43832);
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(1);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(48);
        });

        it('serialNumber value', () => {
            const serialNumber = StringValueObject.create('2011-1-1');
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(1);

            const serialNumber2 = StringValueObject.create('2011-1-1');
            const returnType2 = NumberValueObject.create(21);
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(52);
        });

        it('return type 21 follows ISO 8601 at year boundaries', () => {
            const returnType = NumberValueObject.create(21);

            // The last days of December that belong to week 1 of the next year.
            expect(testFunction.calculate(StringValueObject.create('2024-12-30'), returnType).getValue()).toBe(1);
            expect(testFunction.calculate(StringValueObject.create('2025-12-29'), returnType).getValue()).toBe(1);
            // Week 1 starts in the last days of the previous year when 1 January is Friday or Saturday.
            expect(testFunction.calculate(StringValueObject.create('2021-1-4'), returnType).getValue()).toBe(1);
            expect(testFunction.calculate(StringValueObject.create('2021-2-1'), returnType).getValue()).toBe(5);
            expect(testFunction.calculate(StringValueObject.create('2016-1-4'), returnType).getValue()).toBe(1);
        });

        it('ignores the time fraction of a date serial', () => {
            const sundayStart = NumberValueObject.create(1);
            const mondayStart = NumberValueObject.create(2);
            const isoWeek = NumberValueObject.create(21);

            // The last day of a week used to be counted into the next week when a time was present.
            expect(testFunction.calculate(NumberValueObject.create(45654.5), sundayStart).getValue()).toBe(52);
            expect(testFunction.calculate(StringValueObject.create('2024-12-28 12:00'), sundayStart).getValue()).toBe(52);
            expect(testFunction.calculate(StringValueObject.create('2019-01-06 12:00'), mondayStart).getValue()).toBe(1);
            expect(testFunction.calculate(NumberValueObject.create(43471.5), isoWeek).getValue()).toBe(1);
            expect(testFunction.calculate(StringValueObject.create('2024-12-29 12:00'), isoWeek).getValue()).toBe(52);
        });

        it('uses the 1904 epoch when serial is zero', () => {
            testFunction.setDateSystem(DateSystem.Date1900);
            expect(testFunction.calculate(NumberValueObject.create(0), NumberValueObject.create(1)).getValue()).toBe(0);
            testFunction.setDateSystem(DateSystem.Date1904);
            expect(testFunction.calculate(NumberValueObject.create(0), NumberValueObject.create(1)).getValue()).toBe(1);
            testFunction.setDateSystem(DateSystem.Date1900);
        });

        it('Value is error', () => {
            const serialNumber = ErrorValueObject.create(ErrorType.NAME);
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const serialNumber = BooleanValueObject.create(false);
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const serialNumber = NullValueObject.create();
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(1);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = NullValueObject.create();
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is array', () => {
            const serialNumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2008-11-26', '2008-12-4', '2009-1-21'],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const returnType = NumberValueObject.create(1);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
        it('checks the serial-zero boundary in both date systems', () => {
            const serialNumber = NumberValueObject.create(0);
            const returnType = NumberValueObject.create(1);

            testFunction.setDateSystem(DateSystem.Date1900);
            expect(testFunction.calculate(serialNumber, returnType).getValue()).toBe(0);

            testFunction.setDateSystem(DateSystem.Date1904);
            expect(testFunction.calculate(serialNumber, returnType).getValue()).toBe(1);

            testFunction.setDateSystem(DateSystem.Date1900);
        });

        it('uses the Excel weekday for serial 60 in the 1900 date system', () => {
            testFunction.setDateSystem(DateSystem.Date1900);

            expect(testFunction.calculate(NumberValueObject.create(60), NumberValueObject.create(1)).getValue()).toBe(9);
        });
    });
});
