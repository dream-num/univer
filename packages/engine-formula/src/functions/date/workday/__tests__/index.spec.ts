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
import { Workday } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test workday function', () => {
    const testFunction = new Workday(FUNCTION_NAMES_DATE.WORKDAY);

    describe('Workday', () => {
        it('Value is all normal', () => {
            const startDate = StringValueObject.create('2008-10-1');
            const days = NumberValueObject.create(151);
            const result = testFunction.calculate(startDate, days);
            expect(result.getValue()).toStrictEqual(39933);

            const holidays2 = StringValueObject.create('2008-11-26');
            const result2 = testFunction.calculate(startDate, days, holidays2);
            expect(result2.getValue()).toStrictEqual(39934);

            const holidays3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2008-11-26'],
                    ['2008-12-4'],
                    ['2009-1-21'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(startDate, days, holidays3);
            expect(result3.getValue()).toStrictEqual(39938);
        });

        it('Value is not date string', () => {
            const startDate = StringValueObject.create('test');
            const days = NumberValueObject.create(151);
            const result = testFunction.calculate(startDate, days);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate2 = StringValueObject.create('2008-10-1');
            const days2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(startDate2, days2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate3 = StringValueObject.create('2008-10-1');
            const days3 = NumberValueObject.create(151);
            const holidays3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(startDate3, days3, holidays3);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const startDate = NullValueObject.create();
            const days = NumberValueObject.create(151);
            const result = testFunction.calculate(startDate, days);
            expect(result.getValue()).toStrictEqual(212);

            const startDate2 = StringValueObject.create('2008-10-1');
            const days2 = NullValueObject.create();
            const result2 = testFunction.calculate(startDate2, days2);
            expect(result2.getValue()).toStrictEqual(39722);

            const startDate3 = StringValueObject.create('2008-10-1');
            const days3 = NumberValueObject.create(-151);
            const holidays3 = NullValueObject.create();
            const result3 = testFunction.calculate(startDate3, days3, holidays3);
            expect(result3.getValue()).toStrictEqual(39511);
        });

        it('Value is boolean', () => {
            const startDate = BooleanValueObject.create(true);
            const days = NumberValueObject.create(151);
            const result = testFunction.calculate(startDate, days);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate2 = StringValueObject.create('2008-10-1');
            const days2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(startDate2, days2);
            expect(result2.getValue()).toStrictEqual(ErrorType.VALUE);

            const startDate3 = StringValueObject.create('2008-10-1');
            const days3 = NumberValueObject.create(151);
            const holidays3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(startDate3, days3, holidays3);
            expect(result3.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is error', () => {
            const startDate = ErrorValueObject.create(ErrorType.NAME);
            const days = NumberValueObject.create(151);
            const result = testFunction.calculate(startDate, days);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const startDate2 = StringValueObject.create('2008-10-1');
            const days2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(startDate2, days2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);

            const startDate3 = StringValueObject.create('2008-10-1');
            const days3 = NumberValueObject.create(151);
            const holidays3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(startDate3, days3, holidays3);
            expect(result3.getValue()).toStrictEqual(ErrorType.NAME);
        });
    });
});
