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
import { BooleanValueObject, NullValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Numbervalue } from '../index';

describe('Test numbervalue function', () => {
    const testFunction = new Numbervalue(FUNCTION_NAMES_TEXT.NUMBERVALUE);

    describe('Numbervalue', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('2.500,27');
            const decimalSeparator = StringValueObject.create(',');
            const groupSeparator = StringValueObject.create('.');
            const result = testFunction.calculate(text, decimalSeparator, groupSeparator);
            expect(getObjectValue(result)).toStrictEqual(2500.27);
        });

        it('Value is has percentage', () => {
            const text = StringValueObject.create('3.5%');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(0.035);
        });

        it('DecimalSeparator value test', () => {
            const text = StringValueObject.create('2.500,27');
            const decimalSeparator = ErrorValueObject.create(ErrorType.NAME);
            const groupSeparator = StringValueObject.create('.');
            const result = testFunction.calculate(text, decimalSeparator, groupSeparator);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const decimalSeparator2 = NullValueObject.create();
            const result2 = testFunction.calculate(text, decimalSeparator2, groupSeparator);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const decimalSeparator3 = StringValueObject.create('.');
            const result3 = testFunction.calculate(text, decimalSeparator3, groupSeparator);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const decimalSeparator4 = BooleanValueObject.create(true);
            const result4 = testFunction.calculate(text, decimalSeparator4, groupSeparator);
            expect(getObjectValue(result4)).toStrictEqual(250027);
        });

        it('GroupSeparator value test', () => {
            const text = StringValueObject.create('2.500,27');
            const decimalSeparator = StringValueObject.create(',');
            const groupSeparator = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(text, decimalSeparator, groupSeparator);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const groupSeparator2 = NullValueObject.create();
            const result2 = testFunction.calculate(text, decimalSeparator, groupSeparator2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const groupSeparator3 = StringValueObject.create(',');
            const result3 = testFunction.calculate(text, decimalSeparator, groupSeparator3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const groupSeparator4 = BooleanValueObject.create(true);
            const result4 = testFunction.calculate(text, decimalSeparator, groupSeparator4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const text = BooleanValueObject.create(true);
            const decimalSeparator = StringValueObject.create(',');
            const groupSeparator = StringValueObject.create('.');
            const result = testFunction.calculate(text, decimalSeparator, groupSeparator);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is error', () => {
            const text = ErrorValueObject.create(ErrorType.NAME);
            const decimalSeparator = StringValueObject.create(',');
            const groupSeparator = StringValueObject.create('.');
            const result = testFunction.calculate(text, decimalSeparator, groupSeparator);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual([
                [1, 0, 1.23, ErrorType.VALUE, ErrorType.VALUE, 0],
                [0, 100, 2.34, ErrorType.VALUE, -3, ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const text = StringValueObject.create('2.50,0,27');
            const decimalSeparator = StringValueObject.create(',');
            const groupSeparator = StringValueObject.create('.');
            const result = testFunction.calculate(text, decimalSeparator, groupSeparator);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const text2 = StringValueObject.create('2.50,027%');
            const decimalSeparator2 = StringValueObject.create('a');
            const result2 = testFunction.calculate(text2, decimalSeparator2, groupSeparator);
            expect(getObjectValue(result2)).toStrictEqual(2500.27);

            const text3 = StringValueObject.create('2a.50027%');
            const result3 = testFunction.calculate(text3, decimalSeparator, groupSeparator);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const text4 = StringValueObject.create('2a.50,027%');
            const result4 = testFunction.calculate(text4, decimalSeparator, groupSeparator);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

            const text5 = StringValueObject.create('20%%');
            const result5 = testFunction.calculate(text5, decimalSeparator, groupSeparator);
            expect(getObjectValue(result5)).toStrictEqual(0.002);
        });
    });
});
