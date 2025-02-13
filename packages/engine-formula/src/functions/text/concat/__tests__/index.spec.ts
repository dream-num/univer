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
import { Concat } from '../index';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test concat function', () => {
    const testFunction = new Concat(FUNCTION_NAMES_TEXT.CONCAT);

    describe('Concat', () => {
        it('Text is single cell', () => {
            const text1 = StringValueObject.create('Start ');
            const text2 = StringValueObject.create('End');
            const result = testFunction.calculate(text1, text2);
            expect(result.getValue()).toBe('Start End');
        });

        it('Text is single cell with quotation marks', () => {
            const text1 = StringValueObject.create('"Hello ""World"');
            const result = testFunction.calculate(text1);
            expect(result.getValue()).toBe('"Hello ""World"');
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
            expect(result.getValue()).toBe('a123234345');
        });

        it('Text1 is array with blank cell', () => {
            const text1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    [null],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text1);
            expect(result.getValue()).toBe('');
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
            expect(result.getValue()).toBe('123234345a');
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
            expect(result.getValue()).toBe('abc123');
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
            expect(result.getValue()).toBe('ad012304345');
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
            const result = testFunction.calculate(text);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Text1 is array with multi type cells', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text);
            expect(result.getValue()).toBe('1 1.23TRUEFALSE01002.34test-3');
        });
    });
});
