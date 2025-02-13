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
import { Eomonth } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test eomonth function', () => {
    const testFunction = new Eomonth(FUNCTION_NAMES_DATE.EOMONTH);

    describe('Eomonth', () => {
        it('value is normal', () => {
            const startDate = StringValueObject.create('2011/1/1');

            let months = NumberValueObject.create(1);
            let result = testFunction.calculate(startDate, months);
            expect(result.getValue()).toStrictEqual(40602);

            months = NumberValueObject.create(-3);
            result = testFunction.calculate(startDate, months);
            expect(result.getValue()).toStrictEqual(40482);
        });

        it('value is error', () => {
            const startDate = StringValueObject.create('2011/1/1');
            const months = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(startDate, months);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('value is boolean', () => {
            const startDate = StringValueObject.create('2011/1/1');

            let months = BooleanValueObject.create(true);
            let result = testFunction.calculate(startDate, months);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            months = BooleanValueObject.create(false);
            result = testFunction.calculate(startDate, months);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('value is normal string', () => {
            const startDate = StringValueObject.create('test');
            const months = NumberValueObject.create(1);
            const result = testFunction.calculate(startDate, months);
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
            const months = NumberValueObject.create(1);
            const result = testFunction.calculate(startDate, months);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});
