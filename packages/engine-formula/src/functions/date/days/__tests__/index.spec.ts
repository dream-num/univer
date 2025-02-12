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
import { Days } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test days function', () => {
    const testFunction = new Days(FUNCTION_NAMES_DATE.DAYS);

    describe('Days', () => {
        it('value is serial number', () => {
            const endDate = NumberValueObject.create(43832.233);
            const startDate = NumberValueObject.create(1);
            const result = testFunction.calculate(endDate, startDate);
            expect(result.getValue()).toStrictEqual(43831);
        });

        it('value is error', () => {
            const endDate = ErrorValueObject.create(ErrorType.NAME);
            const startDate = NumberValueObject.create(1);
            const result = testFunction.calculate(endDate, startDate);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('value is boolean', () => {
            const endDate = NumberValueObject.create(43832.233);
            const startDate = BooleanValueObject.create(false);
            const result = testFunction.calculate(endDate, startDate);
            expect(result.getValue()).toStrictEqual(43832);
        });

        it('value is date string', () => {
            const endDate = StringValueObject.create('2021-12-31');
            const startDate = StringValueObject.create('2021-01-01');
            const result = testFunction.calculate(endDate, startDate);
            expect(result.getValue()).toStrictEqual(364);
        });

        it('value is normal string', () => {
            const endDate = StringValueObject.create('2021-12-31');
            const startDate = StringValueObject.create('test');
            const result = testFunction.calculate(endDate, startDate);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('value is array', () => {
            const endDate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-2-12', 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const startDate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    ['1900-1-1'],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(endDate, startDate);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [40951, ErrorType.VALUE, 1, 0, ErrorType.NAME, 0],
                [40950, ErrorType.VALUE, 0, -1, ErrorType.NAME, -1],
            ]);
        });
    });
});
