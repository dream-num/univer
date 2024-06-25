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

import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Left } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test LEFT function', () => {
    const leftFunction = new Left(FUNCTION_NAMES_TEXT.LEFT);

    describe('Left', () => {
        it('Extracts single character from single cell', () => {
            const text = StringValueObject.create('Hello');
            const numChars = NumberValueObject.create(1);
            const result = leftFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['H']]);
        });

        it('Extracts multiple characters from single cell', () => {
            const text = StringValueObject.create('Hello World');
            const numChars = NumberValueObject.create(5);
            const result = leftFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Hello']]);
        });

        it('Handles no numChars passed, defaults to 1', () => {
            const text = StringValueObject.create('Hello');
            const result = leftFunction.calculate(text);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['H']]);
        });

        it('Handles numChars larger than text length', () => {
            const text = StringValueObject.create('Hi');
            const numChars = NumberValueObject.create(10);
            const result = leftFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Hi']]);
        });

        it('Handles empty text', () => {
            const text = StringValueObject.create('');
            const numChars = NumberValueObject.create(1);
            const result = leftFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['']]);
        });

        it('Handles negative numChars', () => {
            const text = StringValueObject.create('Hello');
            const numChars = NumberValueObject.create(-1);
            const result = leftFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.VALUE]]);
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
            const result = leftFunction.calculate(textArray, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['Hel'], // First character of 'Hello'
                ['Wor'], // First two characters of 'World'
                ['New'], // First three characters of 'Test'
                ['Exa'], // First four characters of 'Example'
            ]);
        });
        it('Extracts characters from single text by specifying array of numChar', () => {
            const text = StringValueObject.create('Hello');
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
            const result = leftFunction.calculate(text, numCharsArray);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['H'], // First character of 'Hello'
                ['He'], // First two characters of 'World'
                ['Hel'], // First three characters of 'Test'
                ['Hell'], // First four characters of 'Example'
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
            const result = leftFunction.calculate(textArray, numCharsArray);
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
            const result = leftFunction.calculate(textArray);
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
            const result = leftFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Hello 😊']]);
        });

        it('Handles extracting with numChars as zero', () => {
            const text = StringValueObject.create('Hello');
            const numChars = NumberValueObject.create(0);
            const result = leftFunction.calculate(text, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['']]);
        });
    });
});
