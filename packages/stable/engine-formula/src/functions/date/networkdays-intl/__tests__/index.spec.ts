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
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { NetworkdaysIntl } from '../index';

describe('Test networkdays.intl function', () => {
    const testFunction = new NetworkdaysIntl(FUNCTION_NAMES_DATE.NETWORKDAYS);

    describe('NetworkdaysIntl', () => {
        it('Value is all date string', () => {
            const startDate = StringValueObject.create('2012-10-1');
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(getObjectValue(result)).toStrictEqual(110);

            const weekend2 = NumberValueObject.create(6);
            const holidays2 = StringValueObject.create('2012-11-22');
            const result2 = testFunction.calculate(startDate, endDate, weekend2, holidays2);
            expect(getObjectValue(result2)).toStrictEqual(108);

            const weekend3 = StringValueObject.create('0011001');
            const holidays3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-11-22'],
                    ['2012-12-4'],
                    ['2013-1-21'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(startDate, endDate, weekend3, holidays3);
            expect(getObjectValue(result3)).toStrictEqual(85);
        });

        it('Value is number or date string', () => {
            const startDate = NumberValueObject.create(45122);
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(getObjectValue(result)).toStrictEqual(-2706);
        });

        it('Value is not date string', () => {
            const startDate = StringValueObject.create('test');
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const weekend3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(startDate3, endDate3, weekend3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const startDate4 = StringValueObject.create('2012-10-1');
            const endDate4 = StringValueObject.create('2013-3-1');
            const weekend4 = StringValueObject.create('1110001');
            const holidays4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(startDate4, endDate4, weekend4, holidays4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const startDate = NullValueObject.create();
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(getObjectValue(result)).toStrictEqual(29525);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = NullValueObject.create();
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(getObjectValue(result2)).toStrictEqual(-29416);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const weekend3 = NullValueObject.create();
            const result3 = testFunction.calculate(startDate3, endDate3, weekend3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NUM);

            const startDate4 = StringValueObject.create('2012-10-1');
            const endDate4 = StringValueObject.create('2013-3-1');
            const weekend4 = NumberValueObject.create(5);
            const holidays4 = NullValueObject.create();
            const result4 = testFunction.calculate(startDate4, endDate4, weekend4, holidays4);
            expect(getObjectValue(result4)).toStrictEqual(108);
        });

        it('Value is boolean', () => {
            const startDate = BooleanValueObject.create(true);
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const weekend3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(startDate3, endDate3, weekend3);
            expect(getObjectValue(result3)).toStrictEqual(110);

            const startDate4 = StringValueObject.create('2012-10-1');
            const endDate4 = StringValueObject.create('2013-3-1');
            const weekend4 = NumberValueObject.create(1);
            const holidays4 = BooleanValueObject.create(true);
            const result4 = testFunction.calculate(startDate4, endDate4, weekend4, holidays4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is error', () => {
            const startDate = ErrorValueObject.create(ErrorType.NAME);
            const endDate = StringValueObject.create('2013-3-1');
            const result = testFunction.calculate(startDate, endDate);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const startDate2 = StringValueObject.create('2012-10-1');
            const endDate2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const startDate3 = StringValueObject.create('2012-10-1');
            const endDate3 = StringValueObject.create('2013-3-1');
            const weekend3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(startDate3, endDate3, weekend3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);

            const startDate4 = StringValueObject.create('2012-10-1');
            const endDate4 = StringValueObject.create('2013-3-1');
            const weekend4 = NumberValueObject.create(1);
            const holidays4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(startDate4, endDate4, weekend4, holidays4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);
        });

        it('Weekend value is array', () => {
            const startDate = StringValueObject.create('2012-10-1');
            const endDate = StringValueObject.create('2013-3-1');
            const weekend = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, null, null],
                    ['abc', null, null],
                    [6, null, null],
                    [8, null, null],
                ]),
                rowCount: 4,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const holidays = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-11-22'],
                    ['2012-12-4'],
                    ['2013-1-21'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(startDate, endDate, weekend, holidays);
            expect(getObjectValue(result)).toStrictEqual([
                [107, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM],
                [106, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
            ]);
        });

        it('More test', () => {
            const startDate = StringValueObject.create('2024-11-25');
            const endDate = StringValueObject.create('2024-11-25');
            const result = testFunction.calculate(startDate, endDate);
            expect(getObjectValue(result)).toBe(1);

            const startDate2 = StringValueObject.create('2024-11-24');
            const endDate2 = StringValueObject.create('2024-11-25');
            const result2 = testFunction.calculate(startDate2, endDate2);
            expect(getObjectValue(result2)).toBe(1);

            const startDate3 = StringValueObject.create('2024-11-25');
            const endDate3 = StringValueObject.create('2024-11-26');
            const result3 = testFunction.calculate(startDate3, endDate3);
            expect(getObjectValue(result3)).toBe(2);
        });
    });
});
