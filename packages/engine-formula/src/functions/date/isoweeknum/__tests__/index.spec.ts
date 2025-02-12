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
import { Isoweeknum } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test isoweeknum function', () => {
    const testFunction = new Isoweeknum(FUNCTION_NAMES_DATE.ISOWEEKNUM);

    describe('Isoweeknum', () => {
        it('date value is normal', () => {
            const date = NumberValueObject.create(43832);
            const result = testFunction.calculate(date);
            expect(result.getValue()).toStrictEqual(1);

            const date2 = StringValueObject.create('2008-11-26');
            const result2 = testFunction.calculate(date2);
            expect(result2.getValue()).toStrictEqual(48);
        });

        it('date value', () => {
            const date = StringValueObject.create('2011-1-1');
            const result = testFunction.calculate(date);
            expect(result.getValue()).toStrictEqual(52);
        });

        it('date is error', () => {
            const date = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(date);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('date is boolean', () => {
            const date = BooleanValueObject.create(true);
            const result = testFunction.calculate(date);
            expect(result.getValue()).toStrictEqual(52);
        });

        it('Value is blank cell', () => {
            const date = NullValueObject.create();
            const result = testFunction.calculate(date);
            expect(result.getValue()).toStrictEqual(52);
        });

        it('Value is array', () => {
            const date = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2011-1-1', true, false, null, ErrorType.NAME, 26, '1900-2-21'],
                ]),
                rowCount: 1,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(date);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [52, 52, 52, 52, ErrorType.NAME, 4, 8],
            ]);
        });
    });
});
