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
import { BooleanValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { excelTextSerializationFunctions } from '../../excel-text-serialization';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Concat } from '../index';

describe('Test concat function', () => {
    const testFunction = new Concat(FUNCTION_NAMES_TEXT.CONCAT);

    describe('Excel CONCAT error propagation', () => {
        const registration = excelTextSerializationFunctions.find(([, name]) => name === FUNCTION_NAMES_TEXT.CONCAT);
        if (!registration) {
            throw new Error('Missing Excel CONCAT registration');
        }
        const [ExcelConcat] = registration;
        const registeredFunction = new ExcelConcat(FUNCTION_NAMES_TEXT.CONCAT);
        if (!(registeredFunction instanceof Concat)) {
            throw new Error('The registered Excel CONCAT must extend Concat');
        }
        const excelFunction = registeredFunction;

        it.each([ErrorType.NA, ErrorType.DIV_BY_ZERO])('preserves a later scalar %s after exceeding the cell limit', (errorType) => {
            const error = ErrorValueObject.create(errorType);
            const prefix = StringValueObject.create('a'.repeat(32767));

            expect(excelFunction.calculate(prefix, StringValueObject.create('b'), error)).toBe(error);
            expect(excelFunction.calculate(ArrayValueObject.createByArray([['a'.repeat(32767), 'b']]), error)).toBe(error);
        });

        it.each([32766, 32767, 32768])('retains the registered Excel length result at %s characters', (length) => {
            const text = 'x'.repeat(length);
            for (const value of [StringValueObject.create(text), ArrayValueObject.createByArray([[text]])]) {
                const result = excelFunction.calculate(value);
                expect(result.getValue()).toBe(length > 32767 ? ErrorType.CALC : text);
            }
        });

        it.each([
            [ErrorType.NA, 0],
            [ErrorType.NA, 1],
            [ErrorType.NA, 2],
            [ErrorType.VALUE, 0],
            [ErrorType.VALUE, 1],
            [ErrorType.VALUE, 2],
            [ErrorType.DIV_BY_ZERO, 0],
            [ErrorType.DIV_BY_ZERO, 1],
            [ErrorType.DIV_BY_ZERO, 2],
        ] as const)('propagates scalar %s at argument position %s', (errorType, position) => {
            const error = ErrorValueObject.create(errorType);
            const args = [StringValueObject.create('before'), StringValueObject.create('after')];
            const result = excelFunction.calculate(...args.slice(0, position), error, ...args.slice(position));

            expect(result).toBe(error);
        });

        it.each([false, true])('preserves argument-order error precedence with an array (arrayFirst=%s)', (arrayFirst) => {
            const scalar = ErrorValueObject.create(ErrorType.NUM);
            const array = ArrayValueObject.createByArray([['text', ErrorType.REF]]);
            const result = arrayFirst ? excelFunction.calculate(array, scalar) : excelFunction.calculate(scalar, array);

            expect(result.getValue()).toBe(arrayFirst ? ErrorType.REF : ErrorType.NUM);
        });

        it('keeps literal error-looking text as text', () => {
            const result = excelFunction.calculate(StringValueObject.create('#N/A'), StringValueObject.create(' value'));
            expect(result.getValue()).toBe('#N/A value');
        });
    });

    describe('Concat', () => {
        it.each([32766, 32767, 32768])('enforces the cell limit at %s characters across scalar, range and formatted inputs', (length) => {
            const text = 'x'.repeat(length);
            const prefix = text.slice(0, 16000);
            const suffix = text.slice(16000);
            const inputs = [
                [StringValueObject.create(text)],
                [ArrayValueObject.createByArray([[text]])],
                [StringValueObject.create(prefix), ArrayValueObject.createByArray([[suffix]])],
                [BooleanValueObject.create(true), StringValueObject.create('x'.repeat(length - 4))],
            ];

            for (const args of inputs) {
                const result = testFunction.calculate(...args);
                if (length > 32767) {
                    expect(result.getValue()).toBe(ErrorType.VALUE);
                } else {
                    expect(result.isString()).toBe(true);
                    expect(`${result.getValue()}`).toHaveLength(length);
                    expect(result.getValue()).toBe(args[0].isBoolean() ? `TRUE${'x'.repeat(length - 4)}` : text);
                }
            }
        });

        it.each([false, true])('preserves an array input error around an oversized string (errorFirst=%s)', (errorFirst) => {
            const oversized = 'x'.repeat(32768);
            const values = errorFirst ? [ErrorType.NA, oversized] : [oversized, ErrorType.NA];
            const result = testFunction.calculate(ArrayValueObject.createByArray([values]));

            expect(result.getValue()).toBe(ErrorType.NA);
        });

        it('retains native scalar-error handling after exceeding the cell limit', () => {
            const result = testFunction.calculate(StringValueObject.create('x'.repeat(32768)), ErrorValueObject.create(ErrorType.NA));
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('retains native scalar-error handling', () => {
            const result = testFunction.calculate(StringValueObject.create('before'), ErrorValueObject.create(ErrorType.NA), StringValueObject.create('after'));
            expect(result.getValue()).toBe('beforeafter');
        });

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
