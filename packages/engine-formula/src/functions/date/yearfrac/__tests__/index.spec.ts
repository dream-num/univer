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
import { Yearfrac } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test yearfrac function', () => {
    const testFunction = new Yearfrac(FUNCTION_NAMES_DATE.YEARFRAC);

    describe('Yearfrac', () => {
        it('value is normal', () => {
            const startDate = StringValueObject.create('2012/2/2');
            const endDate = StringValueObject.create('2021/3/11');

            let result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(9.108333333333333);

            const basis = NumberValueObject.create(1);
            result = testFunction.calculate(startDate, endDate, basis);
            expect(result.getValue()).toStrictEqual(9.102107856556255);
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
            const result = testFunction.calculate(startDate, endDate);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
