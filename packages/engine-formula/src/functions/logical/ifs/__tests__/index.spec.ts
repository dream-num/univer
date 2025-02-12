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

import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Ifs } from '../index';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test ifs function', () => {
    const textFunction = new Ifs(FUNCTION_NAMES_LOGICAL.IFS);

    describe('Ifs', () => {
        it('Single condition true', () => {
            const condition1 = BooleanValueObject.create(true);
            const result1 = NumberValueObject.create(1);
            const result = textFunction.calculate(condition1, result1);
            expect(result.getValue()).toBe(1);
        });

        it('Single condition false', () => {
            const condition1 = BooleanValueObject.create(false);
            const result1 = NumberValueObject.create(1);
            const result = textFunction.calculate(condition1, result1);
            expect(result.getValue()).toBe(ErrorType.NA);
        });

        it('Multiple conditions first true', () => {
            const condition1 = BooleanValueObject.create(true);
            const result1 = NumberValueObject.create(1);
            const condition2 = BooleanValueObject.create(false);
            const result2 = NumberValueObject.create(2);
            const result = textFunction.calculate(condition1, result1, condition2, result2);
            expect(result.getValue()).toBe(1);
        });

        it('Multiple conditions second true', () => {
            const condition1 = BooleanValueObject.create(false);
            const result1 = NumberValueObject.create(1);
            const condition2 = BooleanValueObject.create(true);
            const result2 = NumberValueObject.create(2);
            const result = textFunction.calculate(condition1, result1, condition2, result2);
            expect(result.getValue()).toBe(2);
        });

        it('All conditions false', () => {
            const condition1 = BooleanValueObject.create(false);
            const result1 = NumberValueObject.create(1);
            const condition2 = BooleanValueObject.create(false);
            const result2 = NumberValueObject.create(2);
            const result = textFunction.calculate(condition1, result1, condition2, result2);
            expect(result.getValue()).toBe(ErrorType.NA);
        });

        it('Condition is array', () => {
            const condition1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false],
                    [true],
                    [false],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result1 = NumberValueObject.create(1);
            const result = textFunction.calculate(condition1, result1);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.NA],
                [1],
                [ErrorType.NA],
            ]);
        });

        it('Multiple conditions as arrays', () => {
            const condition1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false],
                    [true],
                    [false],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result1 = NumberValueObject.create(1);
            const condition2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [false],
                    [true],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = NumberValueObject.create(2);
            const result = textFunction.calculate(condition1, result1, condition2, result2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [2],
                [1],
                [2],
            ]);
        });

        it('Conditions and results are arrays', () => {
            const condition1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false, true],
                    [true, false],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [3, 4],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const condition2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, false],
                    [false, true],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [5, 6],
                    [7, 8],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(condition1, result1, condition2, result2);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [5, 2],
                [3, 8],
            ]);
        });

        it('Handles null values correctly', () => {
            const condition1 = NullValueObject.create();
            const result1 = NumberValueObject.create(1);
            const result = textFunction.calculate(condition1, result1);
            expect(result.getValue()).toBe(ErrorType.NA);
        });

        it('Handles error values in conditions', () => {
            const condition1 = ErrorValueObject.create(ErrorType.VALUE);
            const result1 = NumberValueObject.create(1);
            const result = textFunction.calculate(condition1, result1);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Handles error values in results', () => {
            const condition1 = BooleanValueObject.create(true);
            const result1 = ErrorValueObject.create(ErrorType.VALUE);
            const result = textFunction.calculate(condition1, result1);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});
