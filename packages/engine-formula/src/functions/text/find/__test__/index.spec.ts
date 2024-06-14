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
import { Find } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test find function', () => {
    const findFunction = new Find(FUNCTION_NAMES_TEXT.FIND);

    describe('Find', () => {
        it('Find text in single cell', () => {
            const findText = StringValueObject.create('Univer');
            const withinText = StringValueObject.create('Hello Univer');
            const result = findFunction.calculate(findText, withinText);
            expect(result.getValue()).toStrictEqual(7); // Indexing is 1-based
        });

        it('Find text with start position', () => {
            const findText = StringValueObject.create('o');
            const withinText = StringValueObject.create('Hello World');
            const startNum = NumberValueObject.create(5);
            const result = findFunction.calculate(findText, withinText, startNum);
            expect(result.getValue()).toStrictEqual(5); // Finds 'o' at position 5
        });
        it('Find text not found', () => {
            const findText = StringValueObject.create('xyz');
            const withinText = StringValueObject.create('Hello World');
            const result = findFunction.calculate(findText, withinText);
            expect(result.isError()).toBe(true); ;
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE); // Text not found
        });
        it('Find text in case sensitive', () => {
            const findText = StringValueObject.create('hello');
            const withinText = StringValueObject.create('Hello World');
            const result = findFunction.calculate(findText, withinText);
            expect(result.isError()).toBe(true); ;
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE); // Text not found
        });
        it('Find text in array', () => {
            const findText = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Univer'],
                    ['World'],
                    ['Test'],
                    ['xyz'],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const withinText = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Hello Univer'],
                    ['Hello World'],
                    ['This is a Test'],
                    ['Hello World'],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = findFunction.calculate(findText, withinText);
            const resultArray = result.getArrayValue().map((row) =>
                row.map((cell) => cell?.isError() ? cell.getValue() : cell?.getValue())
            );
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [7], // 'Univer' found at position 7
                [7], // 'World' found at position 7
                [11], // 'Test' found at position 11
                [ErrorType.VALUE],
            ]);
        });

        it('Find text with array and start positions', () => {
            const findText = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['o'],
                    ['l'],
                    ['W'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const withinText = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Hello World'],
                    ['Hello World'],
                    ['Hello World'],
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
                    [4],
                    [7],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = findFunction.calculate(findText, withinText, startNum);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [5], // 'o' found at position 5
                [4], // 'l' found at position 4
                [7], // 'W' found at position 8
            ]);
        });

        it('Find text with emoji', () => {
            const findText = StringValueObject.create('😊');
            const withinText = StringValueObject.create('Hello 😊 World');
            const result = findFunction.calculate(findText, withinText);
            expect(result.getValue()).toStrictEqual(7); // '😊' found at position 7
        });
    });
});
