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
import { Not } from '../index';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test not function', () => {
    const textFunction = new Not(FUNCTION_NAMES_LOGICAL.NOT);

    describe('Not', () => {
        it('logical value is true', () => {
            const logicalValue = BooleanValueObject.create(true);
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(false);
        });

        it('logical value is false', () => {
            const logicalValue = BooleanValueObject.create(false);
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(true);
        });

        it('logical value is number 1', () => {
            const logicalValue = NumberValueObject.create(1);
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(false);
        });

        it('logical value is number 0', () => {
            const logicalValue = NumberValueObject.create(0);
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(true);
        });

        it('logical value is string', () => {
            const logicalValue = StringValueObject.create('text');
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('logical value is null', () => {
            const logicalValue = NullValueObject.create();
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('logical value is array with booleans', () => {
            const logicalValue = ArrayValueObject.create({
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
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('logical value is array with numbers', () => {
            const logicalValue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [0],
                    [1],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('logical value is array with mixed values', () => {
            const logicalValue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [0],
                    ['text'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(logicalValue);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});
