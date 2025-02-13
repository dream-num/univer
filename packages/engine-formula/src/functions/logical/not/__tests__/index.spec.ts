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
import { Not } from '../index';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test not function', () => {
    const textFunction = new Not(FUNCTION_NAMES_LOGICAL.NOT);

    describe('Not', () => {
        it('logical string', () => {
            const logical = StringValueObject.create('a1');
            const result = textFunction.calculate(logical);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('logical number 1', () => {
            const logical = NumberValueObject.create(1);
            const result = textFunction.calculate(logical);
            expect(result.getValue()).toBe(false);
        });

        it('logical number 0', () => {
            const logical = NumberValueObject.create(0);
            const result = textFunction.calculate(logical);
            expect(result.getValue()).toBe(true);
        });

        it('logical null', () => {
            const logical = NullValueObject.create();
            const result = textFunction.calculate(logical);
            expect(result.getValue()).toBe(true);
        });

        it('logical true', () => {
            const logical = BooleanValueObject.create(true);
            const result = textFunction.calculate(logical);
            expect(result.getValue()).toBe(false);
        });

        it('logical false', () => {
            const logical = BooleanValueObject.create(false);
            const result = textFunction.calculate(logical);
            expect(result.getValue()).toBe(true);
        });

        it('logical is array, no logical value', () => {
            const logical = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a1'],
                    ['a2'],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(logical);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.VALUE], [ErrorType.VALUE]]);
        });

        it('logical is array with logical values', () => {
            const logical = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [false],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(logical);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[false], [true]]);
        });

        it('logical is array with mixed values', () => {
            const logical = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [1],
                    ['a1'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(logical);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[false], [false], [ErrorType.VALUE]]);
        });
    });
});
