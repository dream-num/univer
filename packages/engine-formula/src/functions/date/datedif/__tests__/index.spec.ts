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

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Datedif } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

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
        });

        it('value is error', () => {
            const startDate = NumberValueObject.create(1);
            const endDate = ErrorValueObject.create(ErrorType.NAME);
            const unit = StringValueObject.create('YY');
            const result = testFunction.calculate(startDate, endDate, unit);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
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
            const endDate = StringValueObject.create('2021-12-31');
            const unit = StringValueObject.create('d');
            const result = testFunction.calculate(startDate, endDate, unit);
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
            expect(result.getValue()).toStrictEqual(6);
        });
    });
});
