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
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Datedif } from '../index';

describe('Test datedif function', () => {
    const testFunction = new Datedif(FUNCTION_NAMES_DATE.DATEDIF);

    describe('Datedif', () => {
        it('value is normal', () => {
            const startDate = StringValueObject.create('2011/1/29');
            const endDate = StringValueObject.create('2021/3/31');

            let unit = StringValueObject.create('Y');
            let result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(10);

            unit = StringValueObject.create('M');
            result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(122);

            unit = StringValueObject.create('d');
            result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(3714);

            unit = StringValueObject.create('md');
            result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(2);

            unit = StringValueObject.create('ym');
            result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(2);

            unit = StringValueObject.create('yd');
            result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(61);
        });

        it('value is normal, endDate < startDate', () => {
            const startDate = StringValueObject.create('2021/3/31');
            const endDate = StringValueObject.create('2011/1/29');
            const unit = StringValueObject.create('Y');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('unit value is not normal', () => {
            const startDate = StringValueObject.create('2011/1/29');
            const endDate = StringValueObject.create('2021/3/31');
            const unit = StringValueObject.create('YY');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            const unit2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(startDate, endDate, unit2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);

            const unit3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(startDate, endDate, unit3);
            expect(result3.getValue()).toStrictEqual(ErrorType.NUM);

            const unit4 = NumberValueObject.create(11);
            const result4 = testFunction.calculate(startDate, endDate, unit4);
            expect(result4.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('value is error', () => {
            const startDate = StringValueObject.create('2011/1/29');
            const endDate = ErrorValueObject.create(ErrorType.NAME);
            const unit = StringValueObject.create('d');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const startDate2 = ErrorValueObject.create(ErrorType.NAME);
            const endDate2 = StringValueObject.create('2021/3/31');
            const unit2 = StringValueObject.create('d');
            const result2 = testFunction.calculate(startDate2, endDate2, unit2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('value is boolean', () => {
            const startDate = BooleanValueObject.create(false);
            const endDate = NumberValueObject.create(43832.233);
            const unit = StringValueObject.create('d');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(43832);
        });

        it('value is normal string', () => {
            const startDate = StringValueObject.create('test');
            const endDate = StringValueObject.create('2021-3-31');
            const unit = StringValueObject.create('d');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate2 = StringValueObject.create('2011-1-29');
            const endDate2 = StringValueObject.create('test');
            const unit2 = StringValueObject.create('d');
            const result2 = testFunction.calculate(startDate2, endDate2, unit2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);
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
            const endDate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2018-3-1'],
                    [null],
                    ['2013-3-31'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const unit = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Y'],
                    [null],
                    [1],
                    [null],
                    [null],
                ]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(5);
        });

        it('M more test', () => {
            const startDate = StringValueObject.create('2011/1/1');
            const endDate = StringValueObject.create('2013/9/1');
            const unit = StringValueObject.create('M');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(32);

            const startDate2 = StringValueObject.create('2014/3/1');
            const endDate2 = StringValueObject.create('2016/2/1');
            const result2 = testFunction.calculate(startDate2, endDate2, unit);
            expect(result2.getValue()).toStrictEqual(23);

            const startDate3 = StringValueObject.create('2009/1/2');
            const endDate3 = StringValueObject.create('2012/1/1');
            const result3 = testFunction.calculate(startDate3, endDate3, unit);
            expect(result3.getValue()).toStrictEqual(35);
        });

        it('MD more test', () => {
            const startDate = StringValueObject.create('2010-7-29');
            const endDate = StringValueObject.create('2012-1-28');
            const unit = StringValueObject.create('MD');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(30);

            const endDate2 = StringValueObject.create('2012-2-28');
            const result2 = testFunction.calculate(startDate, endDate2, unit);
            expect(result2.getValue()).toStrictEqual(30);

            const endDate3 = StringValueObject.create('2012-3-28');
            const result3 = testFunction.calculate(startDate, endDate3, unit);
            expect(result3.getValue()).toStrictEqual(28);

            const endDate4 = StringValueObject.create('2012-4-28');
            const result4 = testFunction.calculate(startDate, endDate4, unit);
            expect(result4.getValue()).toStrictEqual(30);

            const endDate5 = StringValueObject.create('2012-5-28');
            const result5 = testFunction.calculate(startDate, endDate5, unit);
            expect(result5.getValue()).toStrictEqual(29);
        });

        it('YM more test', () => {
            const startDate = StringValueObject.create('2011/1/1');
            const endDate = StringValueObject.create('2013/9/1');
            const unit = StringValueObject.create('YM');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(8);

            const startDate2 = StringValueObject.create('2014/3/1');
            const endDate2 = StringValueObject.create('2016/2/1');
            const result2 = testFunction.calculate(startDate2, endDate2, unit);
            expect(result2.getValue()).toStrictEqual(11);

            const startDate3 = StringValueObject.create('2009/1/2');
            const endDate3 = StringValueObject.create('2012/1/1');
            const result3 = testFunction.calculate(startDate3, endDate3, unit);
            expect(result3.getValue()).toStrictEqual(11);
        });

        it('YD more test', () => {
            const startDate = StringValueObject.create('2011/1/1');
            const endDate = StringValueObject.create('2013/9/1');
            const unit = StringValueObject.create('YD');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(243);

            const startDate2 = StringValueObject.create('2014/3/1');
            const endDate2 = StringValueObject.create('2016/2/1');
            const result2 = testFunction.calculate(startDate2, endDate2, unit);
            expect(result2.getValue()).toStrictEqual(337);

            const startDate3 = StringValueObject.create('2009/1/2');
            const endDate3 = StringValueObject.create('2012/1/1');
            const result3 = testFunction.calculate(startDate3, endDate3, unit);
            expect(result3.getValue()).toStrictEqual(364);
        });
    });
});
