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
import { Mid } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

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
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.VALUE]]);
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
                    [1],
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
                ['Hello'],
                ['World'],
                ['is a '],
            ]);
        });

        it('Extract substring with emoji', () => {
            const withinText = StringValueObject.create('Hello 😊 World');
            const startNum = NumberValueObject.create(7);
            const numChars = NumberValueObject.create(2);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['😊 ']]);
        });

        it('Extract substring with invalid start position', () => {
            const withinText = StringValueObject.create('Hello World');
            const startNum = NumberValueObject.create(-1);
            const numChars = NumberValueObject.create(5);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.VALUE]]);
        });

        it('Extract substring with zero length', () => {
            const withinText = StringValueObject.create('Hello World');
            const startNum = NumberValueObject.create(1);
            const numChars = NumberValueObject.create(0);
            const result = midFunction.calculate(withinText, startNum, numChars);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['']]);
        });
    });
});
