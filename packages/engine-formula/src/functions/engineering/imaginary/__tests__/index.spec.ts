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

import { DateSystem, excelDateSerial } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Imaginary } from '../index';

describe('Test imaginary function', () => {
    const testFunction = new Imaginary(FUNCTION_NAMES_ENGINEERING.IMAGINARY);

    describe('Imaginary', () => {
        it('Value is normal number', () => {
            const inumber = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(12);
        });

        it('Value is complex string with a sign inside the imaginary part', () => {
            const inumber = StringValueObject.create('1+2-3i');
            const result = testFunction.calculate(inumber);
            // `2-3` is February 3 of the current year, as in Excel.
            const februaryThird = excelDateSerial(new Date(Date.UTC(new Date().getUTCFullYear(), 1, 3)));
            expect(result.getValue()).toBe(februaryThird);

            const inumber2 = StringValueObject.create('1-2+3i');
            const result2 = testFunction.calculate(inumber2);
            expect(result2.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is complex string with a sign inside the imaginary part on a 1904 workbook', () => {
            const dateSystem1904 = new Imaginary(FUNCTION_NAMES_ENGINEERING.IMAGINARY);
            dateSystem1904.setDateSystem(DateSystem.Date1904);

            const inumber = StringValueObject.create('1+2-3i');
            const result = dateSystem1904.calculate(inumber);
            // The same February 3, written as a serial in the 1904 date system.
            const februaryThird = excelDateSerial(new Date(Date.UTC(new Date().getUTCFullYear(), 1, 3)), DateSystem.Date1904);
            expect(result.getValue()).toBe(februaryThird);
        });

        it('Value is complex string with a part written like cell text', () => {
            const percent = StringValueObject.create('1+50%i');
            expect(testFunction.calculate(percent).getValue()).toBe(0.5);

            const currency = StringValueObject.create('1+$2i');
            expect(testFunction.calculate(currency).getValue()).toBe(2);

            const grouped = StringValueObject.create('1+1,234i');
            expect(testFunction.calculate(grouped).getValue()).toBe(1234);

            const spaced = StringValueObject.create(' 1+2i ');
            expect(testFunction.calculate(spaced).getValue()).toBe(2);
        });

        it('Value is complex string with a part that is not a number', () => {
            const hex = StringValueObject.create('1+0x10i');
            expect(testFunction.calculate(hex).getValue()).toBe(ErrorType.NUM);

            const infinity = StringValueObject.create('1+Infinity i');
            expect(testFunction.calculate(infinity).getValue()).toBe(ErrorType.NUM);
        });

        it('Value is large numbers', () => {
            const inumber = NumberValueObject.create(25698432);
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(0);
        });

        it('Value is number string', () => {
            const inumber = StringValueObject.create('1.5');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(0);
        });

        it('Value is normal string', () => {
            const inumber = StringValueObject.create('test');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is boolean', () => {
            const inumber = BooleanValueObject.create(true);
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const inumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(0);
        });

        it('Value is error', () => {
            const inumber = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const inumber = ArrayValueObject.create({
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
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
