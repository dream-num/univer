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
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Text } from '../index';

describe('Test text function', () => {
    const testFunction = new Text(FUNCTION_NAMES_TEXT.TEXT);

    describe('Text', () => {
        it('Text is single cell, format text is single cell', () => {
            const text1 = NumberValueObject.create(111);
            const formatText = StringValueObject.create('$#,##0.00');
            const result = testFunction.calculate(text1, formatText);
            const resultArray = result.getArrayValue();
            expect(transformToValue(resultArray)).toStrictEqual([['$111.00']]);
        });

        it('Text is single cell, format text number string', () => {
            const text1 = StringValueObject.create('12345');
            const formatText = StringValueObject.create('0000年00月00日');
            const result = testFunction.calculate(text1, formatText);
            const resultArray = result.getArrayValue();
            expect(transformToValue(resultArray)).toStrictEqual([['0001年23月45日']]);
        });

        it('Text is array, format text is array', () => {
            const text1 = new ArrayValueObject({
                calculateValueList: transformToValueObject([[1, ' ', 1.23, true, false, null, 0, '100', '2.34', 'test', -3, ErrorType.NAME]]),
                rowCount: 1,
                columnCount: 12,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const formatText = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1],
                    ['YYYY-MM-DD'],
                    [true],
                    [false],
                    [null],
                    [0],
                    ['100'],
                    ['test'],
                    [-3],
                    [ErrorType.NAME],
                ]),
                rowCount: 10,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text1, formatText);
            const resultArray = result.getArrayValue();
            // =TEXT(-3,"test") => t18990t, match Google Sheets
            expect(transformToValue(resultArray)).toStrictEqual([['1', ' ', '1', true, false, '1', '1', '1', '1', 'test', '-1', ErrorType.NAME], ['1900-01-01', ' ', '1900-01-01', true, false, '1900-01-00', '1900-01-00', '1900-04-09', '1900-01-02', 'test', '1899-12-27', ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], ['', ' ', '', true, false, '', '', '', '', 'test', '-', ErrorType.NAME], ['1', ' ', '1', true, false, '0', '0', '100', '2', 'test', '-3', ErrorType.NAME], ['101', ' ', '101', true, false, '100', '100', '1100', '102', 'test', '-103', ErrorType.NAME], ['t19000t', ' ', 't190012t', true, false, 't19000t', 't19000t', 't19000t', 't190036t', 'test', 't18990t', ErrorType.NAME], ['-3', ' ', '-3', true, false, '-3', '-3', '-3', '-3', 'test', '--3', ErrorType.NAME], [ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME]]);
        });
    });
});
