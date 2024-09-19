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
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Leftb } from '../index';

describe('Test LEFTB function', () => {
    const leftbFunction = new Leftb(FUNCTION_NAMES_TEXT.LEFTB);

    describe('Leftb', () => {
        describe('Single Value Tests', () => {
            it('Should return leftmost bytes of a single text', () => {
                const text = StringValueObject.create('Hello World');
                const numBytes = NumberValueObject.create(5);
                const result = leftbFunction.calculate(text, numBytes);
                expect(transformToValue(result.getArrayValue())).toStrictEqual([['Hello']]);
            });

            it('Should return full text if byte length exceeds text length', () => {
                const text = StringValueObject.create('Hello');
                const numBytes = NumberValueObject.create(10); // Exceeding text length
                const result = leftbFunction.calculate(text, numBytes);
                expect(transformToValue(result.getArrayValue())).toStrictEqual([['Hello']]);
            });

            it('Should handle zero byte length correctly', () => {
                const text = StringValueObject.create('Hello');
                const numBytes = NumberValueObject.create(0); // Zero byte length
                const result = leftbFunction.calculate(text, numBytes);
                expect(transformToValue(result.getArrayValue())).toStrictEqual([['']]);
            });

            it('Should return ErrorType.VALUE for negative byte length', () => {
                const text = StringValueObject.create('Hello');
                const numBytes = NumberValueObject.create(-1); // Negative byte length
                const result = leftbFunction.calculate(text, numBytes);
                expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.VALUE]]);
            });

            it('Should handle emojis and byte length correctly', () => {
                const text = StringValueObject.create('😊Hello');
                const numBytes = NumberValueObject.create(1); // Bytes needed to capture '😊'
                const result = leftbFunction.calculate(text, numBytes);
                expect(transformToValue(result.getArrayValue())).toStrictEqual([['😊']]);
            });
        });

        it('Extracts characters from array by specifying single numChar', () => {
            const textArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Hello'],
                    ['World'],
                    ['New World'],
                    ['Example'],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numChars = NumberValueObject.create(3);
            const result = leftbFunction.calculate(textArray, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['Hel'], // First character of 'Hello'
                ['Wor'], // First two characters of 'World'
                ['New'], // First three characters of 'Test'
                ['Exa'], // First four characters of 'Example'
            ]);
        });
        it('Extracts characters from array', () => {
            const textArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Hello'],
                    ['World'],
                    ['Test'],
                    ['Example'],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numCharsArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                    [4],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = leftbFunction.calculate(textArray, numCharsArray);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['H'], // First character of 'Hello'
                ['Wo'], // First two characters of 'World'
                ['Tes'], // First three characters of 'Test'
                ['Exam'], // First four characters of 'Example'
            ]);
        });

        it('Handles numChars not provided for array', () => {
            const textArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Hello'],
                    ['World'],
                    ['Test'],
                    ['Example'],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = leftbFunction.calculate(textArray);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['H'], // Default to first character of 'Hello'
                ['W'], // Default to first character of 'World'
                ['T'], // Default to first character of 'Test'
                ['E'], // Default to first character of 'Example'
            ]);
        });
        it('Handles extracting from text with emojis', () => {
            const text = StringValueObject.create('Hello 😊 World');
            const numChars = NumberValueObject.create(7);
            const result = leftbFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Hello 😊']]);
        });

        it('Handles extracting with numChars as zero', () => {
            const text = StringValueObject.create('Hello');
            const numChars = NumberValueObject.create(0);
            const result = leftbFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['']]);
        });

        it('Handles extracting CJK, first byte', () => {
            const textArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['销售额'],
                    ['から'],
                    ['이트'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = leftbFunction.calculate(textArray);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [''],
                [''],
                [''],
            ]);
        });

        it('Handles extracting CJK, first character', () => {
            const textArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['销售额'],
                    ['から'],
                    ['이트'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = leftbFunction.calculate(textArray, NumberValueObject.create(2));
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['销'],
                ['か'],
                ['이'],
            ]);
        });
        it('Handles extracting multiple languages', () => {
            const textArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['销售额'],
                    ['uから'],
                    ['이u트'],
                    ['이트u'],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = leftbFunction.calculate(textArray, NumberValueObject.create(3));
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['销'],
                ['uか'],
                ['이u'],
                ['이'],
            ]);
        });
        it('Text is array, numBytes is array', () => {
            const textArray = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null, 0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 12,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const numCharsArray = new ArrayValueObject({
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
            const result = leftbFunction.calculate(textArray, numCharsArray);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['1', ' ', '1', 'T', 'F', '', '0', '1', '2', 't', '-', ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], ['1', ' ', '1', 'T', 'F', '', '0', '1', '2', 't', '-', ErrorType.NAME], ['1', ' ', '1', 'T', 'F', '', '0', '1', '2', 't', '-', ErrorType.NAME], ['', '', '', '', '', '', '', '', '', '', '', ErrorType.NAME], ['', '', '', '', '', '', '', '', '', '', '', ErrorType.NAME], ['', '', '', '', '', '', '', '', '', '', '', ErrorType.NAME], ['1', ' ', '1.23', 'TRUE', 'FALSE', '', '0', '100', '2.34', 'test', '-3', ErrorType.NAME], ['1', ' ', '1.', 'TR', 'FA', '', '0', '10', '2.', 'te', '-3', ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME], [ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME, ErrorType.NAME]]);
        });
    });
});
