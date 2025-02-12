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

import { ArrayValueObject, transformToValue, transformToValueObject } from '../../value-object/array-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../value-object/primitive-object';
import { valueObjectCompare } from '../object-compare';
import { compareToken } from '../../../basics/token';
import { ErrorType } from '../../../basics/error-type';
import { getObjectValue } from '../../../functions/__tests__/create-function-test-bed';

const range = ArrayValueObject.create(/*ts*/ `{
    Ada;
    test1;
    test12;
    Univer
}`);

describe('Test object compare', () => {
    describe('Test valueObjectCompare', () => {
        it('Range and criteria', () => {
            const rangeNumber = ArrayValueObject.create(/*ts*/ `{
                1;
                4;
                44;
                444
            }`);

            const criteria = StringValueObject.create('>40');

            const resultObjectValue = transformToValue(valueObjectCompare(rangeNumber, criteria).getArrayValue());
            expect(resultObjectValue).toStrictEqual([[false], [false], [true], [true]]);
        });

        it('Range with wildcard asterisk', () => {
            const criteriaList = [
                'test*',
                '=test*',
                '>test*',
                '>=test*',
                '<test*',
                '<=test*',
                'test?',
                '=test??',
                '>test?',
                '>=test??',
                '<test?',
                '<=test??',
            ];

            const result = [
                [[false], [true], [true], [false]],
                [[false], [true], [true], [false]],
                [[false], [true], [true], [true]],
                [[false], [true], [true], [true]],
                [[true], [false], [false], [false]],
                [[true], [false], [false], [false]],
                [[false], [true], [false], [false]],
                [[false], [false], [true], [false]],
                [[false], [true], [true], [true]],
                [[false], [true], [true], [true]],
                [[true], [false], [false], [false]],
                [[true], [false], [false], [false]],
            ];

            criteriaList.forEach((criteriaValue, i) => {
                const criteria = StringValueObject.create(criteriaValue);

                const value = transformToValue(valueObjectCompare(range, criteria).getArrayValue());
                expect(value).toStrictEqual(result[i]);
            });
        });

        it('String and string', () => {
            const str1 = StringValueObject.create('a');
            const str2 = StringValueObject.create('中文');

            const compareTokenList = [
                compareToken.EQUALS,
                compareToken.NOT_EQUAL,
                compareToken.GREATER_THAN_OR_EQUAL,
                compareToken.GREATER_THAN,
                compareToken.LESS_THAN_OR_EQUAL,
                compareToken.LESS_THAN,
            ];

            const result = [false, true, false, false, true, true];

            compareTokenList.forEach((token, i) => {
                const value = valueObjectCompare(str1, str2, token);
                expect(value.getValue()).toStrictEqual(result[i]);
            });
        });

        it('String and number', () => {
            const str = StringValueObject.create('a');
            const num = NumberValueObject.create(1);

            const compareTokenList = [
                compareToken.EQUALS,
                compareToken.NOT_EQUAL,
                compareToken.GREATER_THAN_OR_EQUAL,
                compareToken.GREATER_THAN,
                compareToken.LESS_THAN_OR_EQUAL,
                compareToken.LESS_THAN,
            ];

            const result = [false, true, true, true, false, false];

            compareTokenList.forEach((token, i) => {
                const value = valueObjectCompare(str, num, token);
                expect(value.getValue()).toStrictEqual(result[i]);
            });
        });

        it('String and boolean', () => {
            const str = StringValueObject.create('a');
            const bool = BooleanValueObject.create(true);

            const compareTokenList = [
                compareToken.EQUALS,
                compareToken.NOT_EQUAL,
                compareToken.GREATER_THAN_OR_EQUAL,
                compareToken.GREATER_THAN,
                compareToken.LESS_THAN_OR_EQUAL,
                compareToken.LESS_THAN,
            ];

            const result = [false, true, false, false, true, true];

            compareTokenList.forEach((token, i) => {
                const value = valueObjectCompare(str, bool, token);
                expect(value.getValue()).toStrictEqual(result[i]);
            });
        });

        it('Number and string', () => {
            const num = NumberValueObject.create(1);
            const str = StringValueObject.create('a');

            const compareTokenList = [
                compareToken.EQUALS,
                compareToken.NOT_EQUAL,
                compareToken.GREATER_THAN_OR_EQUAL,
                compareToken.GREATER_THAN,
                compareToken.LESS_THAN_OR_EQUAL,
                compareToken.LESS_THAN,
            ];

            const result = [false, true, false, false, true, true];

            compareTokenList.forEach((token, i) => {
                const value = valueObjectCompare(num, str, token);
                expect(value.getValue()).toStrictEqual(result[i]);
            });
        });

        it('Number and number', () => {
            const num1 = NumberValueObject.create(1);
            const num2 = NumberValueObject.create(2);

            const compareTokenList = [
                compareToken.EQUALS,
                compareToken.NOT_EQUAL,
                compareToken.GREATER_THAN_OR_EQUAL,
                compareToken.GREATER_THAN,
                compareToken.LESS_THAN_OR_EQUAL,
                compareToken.LESS_THAN,
            ];

            const result = [false, true, false, false, true, true];

            compareTokenList.forEach((token, i) => {
                const value = valueObjectCompare(num1, num2, token);
                expect(value.getValue()).toStrictEqual(result[i]);
            });
        });

        it('Number and boolean', () => {
            const num = NumberValueObject.create(1);
            const bool = BooleanValueObject.create(true);

            const compareTokenList = [
                compareToken.EQUALS,
                compareToken.NOT_EQUAL,
                compareToken.GREATER_THAN_OR_EQUAL,
                compareToken.GREATER_THAN,
                compareToken.LESS_THAN_OR_EQUAL,
                compareToken.LESS_THAN,
            ];

            const result = [false, true, false, false, true, true];

            compareTokenList.forEach((token, i) => {
                const value = valueObjectCompare(num, bool, token);
                expect(value.getValue()).toStrictEqual(result[i]);
            });
        });
        it('Array contains multi types cell, and compare string', () => {
            const array = ArrayValueObject.create({
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
            const str = StringValueObject.create('> ');

            const value = valueObjectCompare(array, str);
            expect(getObjectValue(value)).toStrictEqual([[false, false, false, true, true, false], [false, false, false, true, false, ErrorType.NAME]]);
        });
    });
});
