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

import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { Ifs } from '../index';

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

        it('Multiple conditions with first true', () => {
            const condition1 = BooleanValueObject.create(true);
            const result1 = NumberValueObject.create(1);
            const condition2 = BooleanValueObject.create(false);
            const result2 = NumberValueObject.create(2);
            const result = textFunction.calculate(condition1, result1, condition2, result2);
            expect(result.getValue()).toBe(1);
        });

        it('Multiple conditions with second true', () => {
            const condition1 = BooleanValueObject.create(false);
            const result1 = NumberValueObject.create(1);
            const condition2 = BooleanValueObject.create(true);
            const result2 = NumberValueObject.create(2);
            const result = textFunction.calculate(condition1, result1, condition2, result2);
            expect(result.getValue()).toBe(2);
        });

        it('Condition array', () => {
            const conditionArray = ArrayValueObject.create({
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
            const result = textFunction.calculate(conditionArray, result1);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Result array', () => {
            const condition1 = BooleanValueObject.create(true);
            const resultArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(condition1, resultArray);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Condition and result arrays', () => {
            const conditionArray = ArrayValueObject.create({
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
            const resultArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(conditionArray, resultArray);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Mixed conditions and results', () => {
            const condition1 = BooleanValueObject.create(false);
            const result1 = NumberValueObject.create(1);
            const conditionArray = ArrayValueObject.create({
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
            const resultArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2],
                    [3],
                    [4],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(condition1, result1, conditionArray, resultArray);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Condition with error', () => {
            const condition1 = ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            const result1 = NumberValueObject.create(1);
            const result = textFunction.calculate(condition1, result1);
            expect(result.getValue()).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Result with error', () => {
            const condition1 = BooleanValueObject.create(true);
            const result1 = ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            const result = textFunction.calculate(condition1, result1);
            expect(result.getValue()).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Unmatched condition and result lengths', () => {
            const condition1 = BooleanValueObject.create(true);
            const result1 = NumberValueObject.create(1);
            const result = textFunction.calculate(condition1, result1, condition1);
            expect(result.getValue()).toBe(ErrorType.NA);
        });
    });
});
