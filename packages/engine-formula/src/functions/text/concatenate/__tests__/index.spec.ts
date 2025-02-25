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

import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Concatenate } from '../index';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test concatenate function', () => {
    const testFunction = new Concatenate(FUNCTION_NAMES_TEXT.CONCATENATE);

    describe('Concatenate', () => {
        it('Text is single cell', () => {
            const text1 = StringValueObject.create('Start ');
            const text2 = StringValueObject.create('End');
            const result = testFunction.calculate(text1, text2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['Start End']]);
        });

        it('Text is single cell with quotation marks', () => {
            const text1 = StringValueObject.create('"Hello ""World"');
            const result = testFunction.calculate(text1);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['"Hello ""World"']]);
        });

        it('Text1 is single cell, text2 is array', () => {
            const text1 = StringValueObject.create('a');
            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [2, 3, 4],
                    [3, 4, 5],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text1, text2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['a1', 'a2', 'a3'], ['a2', 'a3', 'a4'], ['a3', 'a4', 'a5']]);
        });

        it('Text1 is array, text2 is single cell', () => {
            const text1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [2, 3, 4],
                    [3, 4, 5],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const text2 = StringValueObject.create('a');
            const result = testFunction.calculate(text1, text2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['1a', '2a', '3a'], ['2a', '3a', '4a'], ['3a', '4a', '5a']]);
        });

        it('Text1 is 3*1 array, text2 is 1*3 array', () => {
            const text1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a'],
                    ['b'],
                    ['c'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text1, text2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['a1', 'a2', 'a3'], ['b1', 'b2', 'b3'], ['c1', 'c2', 'c3']]);
        });

        it('Text1 is 2*2 array, text2 is 3*3 array', () => {
            const text1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a', 'd'],
                    [0, null],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [0, null, 4],
                    [3, 4, 5],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text1, text2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['a1', 'd2', '#N/A'], ['00', '', '#N/A'], ['#N/A', '#N/A', '#N/A']]);
        });

        it('Text1 is array with multi type cells, includes error', () => {
            const text = new ArrayValueObject({
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
            const text2 = StringValueObject.create('test');
            const result = testFunction.calculate(text, text2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([['1test', ' test', '1.23test', 'TRUEtest', 'FALSEtest', 'test'], ['0test', '100test', '2.34test', 'testtest', '-3test', '#NAME?']]);
        });
    });
});
