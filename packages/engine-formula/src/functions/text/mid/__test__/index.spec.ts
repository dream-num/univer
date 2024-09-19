/**
 * Copyright 2023-present DreamNum Inc.
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
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Mid } from '../index';

describe('Test mid function', () => {
    const midFunction = new Mid(FUNCTION_NAMES_TEXT.MID);

    describe('Mid', () => {
        it('Extract substring from single cell', () => {
            const withinText = StringValueObject.create('Hello Univer');
            const startNum = NumberValueObject.create(7);
            const numChars = NumberValueObject.create(6);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Univer']]);
        });

        it('Extract substring with start position beyond string length', () => {
            const withinText = StringValueObject.create('Hello');
            const startNum = NumberValueObject.create(10);
            const numChars = NumberValueObject.create(5);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['']]);
        });

        it('Extract substring with blank cell', () => {
            const withinText = NullValueObject.create();
            const startNum = NumberValueObject.create(7);
            const numChars = NumberValueObject.create(8);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['']]);
        });

        it('Extract substring with boolean', () => {
            const withinText = BooleanValueObject.create(true);
            const startNum = NumberValueObject.create(2);
            const numChars = NumberValueObject.create(1);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['R']]);
        });

        it('Extract substring with number', () => {
            const withinText = NumberValueObject.create(12345);
            const startNum = NumberValueObject.create(2);
            const numChars = NumberValueObject.create(2);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['23']]);
        });

        it('Extract substring with error', () => {
            const withinText = ErrorValueObject.create(ErrorType.NAME);
            const startNum = NumberValueObject.create(2);
            const numChars = NumberValueObject.create(2);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Extract substring with numChars exceeding string length', () => {
            const withinText = StringValueObject.create('Hello');
            const startNum = NumberValueObject.create(1);
            const numChars = NumberValueObject.create(10);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Hello']]);
        });

        it('Extract substring in array', () => {
            const withinText = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Hello Univer'],
                    ['Hello World'],
                    ['This is a Test'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const startNum = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [7],
                    [7],
                    [6],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numChars = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [5],
                    [5],
                    [5],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['Unive'],
                ['World'],
                ['is a '],
            ]);
        });

        it('Extract substring with array start positions and lengths', () => {
            const withinText = new ArrayValueObject({
                calculateValueList: transformToValueObject([[1, ' ', 1.23, true, false, null, 0, '100', '2.34', 'test', -3, ErrorType.NAME]]),
                rowCount: 1,
                columnCount: 12,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const startNum = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1],
                    [' '],
                    [1.23],
                    [true],
                    [false],
                    [null],
                    [0],
                    ['100'],
                    ['2.34'],
                    ['test'],
                    [-3],
                    [ErrorType.NAME],
                ]),
                rowCount: 12,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numChars = NumberValueObject.create(1);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['1', ' ', '1', 'T', 'F', '', '0', '1', '2', 't', '-', ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], ['1', ' ', '1', 'T', 'F', '', '0', '1', '2', 't', '-', ErrorType.NAME], ['1', ' ', '1', 'T', 'F', '', '0', '1', '2', 't', '-', ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], ['', '', '', '', '', '', '', '', '', '', '', ErrorType.NAME], ['', '', '.', 'R', 'A', '', '', '0', '.', 'e', '3', ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], [ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME]]);
        });

        it('Extract substring with emoji', () => {
            const withinText = StringValueObject.create('Hello😊World');
            const startNum = NumberValueObject.create(6);
            const numChars = NumberValueObject.create(2);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['😊']]);
        });

        it('Extract substring with invalid start position', () => {
            const withinText = StringValueObject.create('Hello World');
            const startNum = new ArrayValueObject({
                calculateValueList: transformToValueObject([[-1, 0, 0.5, 1]]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numChars = new ArrayValueObject({
                calculateValueList: transformToValueObject([[-1], [0], [0.5], [1]]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ''], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ''], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, 'H']]);
        });
    });
});
