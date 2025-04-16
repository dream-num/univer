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

import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Impower } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test impower function', () => {
    const testFunction = new Impower(FUNCTION_NAMES_ENGINEERING.IMPOWER);

    describe('Impower', () => {
        it('Value is normal number', () => {
            const inumber = StringValueObject.create('5+12i');
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe('-2035-828i');

            const number2 = NumberValueObject.create(-3);
            const result2 = testFunction.calculate(inumber, number2);
            expect(result2.getValue()).toBe('-0.000421603589452162+0.000171541902735327i');

            const inumber3 = StringValueObject.create('5-12i');
            const result3 = testFunction.calculate(inumber3, number);
            expect(result3.getValue()).toBe('-2035+828i');
        });

        it('Value is large numbers', () => {
            const inumber = NumberValueObject.create(25698432);
            const number = NumberValueObject.create(895);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const inumber = StringValueObject.create('1.5');
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe(3.375);
        });

        it('Value is normal string', () => {
            const inumber = StringValueObject.create('test');
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Number value is normal string', () => {
            const inumber = StringValueObject.create('5+12i');
            const number = StringValueObject.create('test');
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const inumber = BooleanValueObject.create(true);
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is null', () => {
            const inumber = NullValueObject.create();
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe(ErrorType.NA);
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
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toBe(0);

            const inumber2 = StringValueObject.create('5+12i');
            const number2 = ArrayValueObject.create({
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
            const result2 = testFunction.calculate(inumber2, number2);
            expect(result2.getValue()).toBe(1);

            const inumber3 = ArrayValueObject.create({
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
            const number3 = ArrayValueObject.create({
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
            const result3 = testFunction.calculate(inumber3, number3);
            expect(result3.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const inumber = ErrorValueObject.create(ErrorType.NAME);
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
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
            const number = NumberValueObject.create(3);
            const result = testFunction.calculate(inumber, number);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
