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
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Datevalue } from '../index';

describe('Test datevalue function', () => {
    const testFunction = new Datevalue(FUNCTION_NAMES_DATE.DATEVALUE);

    describe('Datevalue', () => {
        it('Date text string', () => {
            const dateText = StringValueObject.create('2020-01-02');
            const result = testFunction.calculate(dateText);
            expect(result.getValue()).toStrictEqual(43832);

            const dateText2 = StringValueObject.create('5-Jul');
            const result2 = testFunction.calculate(dateText2);
            expect(result2.getValue()).toStrictEqual(45843); // NOTE: this should be updated annually

            const dateText3 = StringValueObject.create('2020-01-02 13:14:15');
            const result3 = testFunction.calculate(dateText3);
            expect(result3.getValue()).toStrictEqual(43832);

            const dateText4 = StringValueObject.create('10:11:12');
            const result4 = testFunction.calculate(dateText4);
            expect(result4.getValue()).toStrictEqual(0);
        });

        it('Date text number', () => {
            const dateText = NumberValueObject.create(43832);
            const result = testFunction.calculate(dateText);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
        it('Date text boolean', () => {
            const dateText = BooleanValueObject.create(true);
            const result = testFunction.calculate(dateText);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Date text blank', () => {
            const dateText = NullValueObject.create();
            const result = testFunction.calculate(dateText);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
        it('Date text error', () => {
            const dateText = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(dateText);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Serial number is array', () => {
            const serialNumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[1, ' ', 1.23, true, false, null], [0, '100', '2.34', 'test', -3, ErrorType.NAME]]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(serialNumber);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.VALUE,
            ], [
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.VALUE,
                ErrorType.NAME,
            ]]);
        });
    });
});
