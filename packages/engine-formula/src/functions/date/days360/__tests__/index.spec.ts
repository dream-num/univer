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

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Days360 } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test days360 function', () => {
    const testFunction = new Days360(FUNCTION_NAMES_DATE.DAYS360);

    describe('Days360', () => {
        it('value is normal', () => {
            const startDate = StringValueObject.create('2021/1/29');
            const endDate = StringValueObject.create('2021/3/31');

            let result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(62);

            const method = NumberValueObject.create(1);
            result = testFunction.calculate(startDate, endDate, method);
            expect(result.getValue()).toStrictEqual(61);
        });

        it('value is normal, endDate < startDate', () => {
            const startDate = StringValueObject.create('2021/3/31');
            const endDate = StringValueObject.create('2021/1/29');

            let result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(-61);

            const method = NumberValueObject.create(1);
            result = testFunction.calculate(startDate, endDate, method);
            expect(result.getValue()).toStrictEqual(-61);
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
            expect(result.getValue()).toStrictEqual(43202);

            const method = BooleanValueObject.create(true);
            result = testFunction.calculate(startDate, endDate, method);
            expect(result.getValue()).toStrictEqual(43202);
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
            const endDate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2008-3-1'],
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
            const method = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
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

            const result = testFunction.calculate(startDate, endDate, method);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [-1468, ErrorType.VALUE, 38940, 38941, ErrorType.NAME],
                [-40409, ErrorType.VALUE, -1, 0, ErrorType.NAME],
                [361, ErrorType.VALUE, 40769, 40770, ErrorType.NAME],
                [ErrorType.NA, ErrorType.VALUE, ErrorType.NA, ErrorType.NA, ErrorType.NAME],
                [ErrorType.NA, ErrorType.VALUE, ErrorType.NA, ErrorType.NA, ErrorType.NAME],
            ]);
        });
    });
});
