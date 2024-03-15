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
import { Or } from '..';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../..';

describe('Test or function', () => {
    const textFunction = new Or(FUNCTION_NAMES_LOGICAL.OR);

    describe('Or', () => {
        it('logical1 string', () => {
            const logical1 = new StringValueObject('a1');
            const result = textFunction.calculate(logical1);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
        it('logical1 number 1', () => {
            const logical1 = new NumberValueObject(1);
            const result = textFunction.calculate(logical1);
            expect(result.getValue()).toBe(true);
        });

        it('logical1 number 0', () => {
            const logical1 = new NumberValueObject(0);
            const result = textFunction.calculate(logical1);
            expect(result.getValue()).toBe(false);
        });

        it('logical1 null', () => {
            const logical1 = new NullValueObject(0);
            const result = textFunction.calculate(logical1);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('logical1 true', () => {
            const logical1 = new BooleanValueObject(true);
            const result = textFunction.calculate(logical1);
            expect(result.getValue()).toBe(true);
        });

        it('logical2 false', () => {
            const logical1 = new BooleanValueObject(true);
            const logical2 = new BooleanValueObject(false);
            const result = textFunction.calculate(logical1, logical2);
            expect(result.getValue()).toBe(true);
        });

        it('logical1 is array, no logical value', () => {
            const logical1 = new ArrayValueObject({
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
            const result = textFunction.calculate(logical1);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('logical1 is array and logical2 is array', () => {
            const logical1 = new ArrayValueObject({
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
            const logical2 = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true],
                    ['a4'],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(logical1, logical2);
            expect(result.getValue()).toBe(true);
        });

        it('logical1 is array and logical2 is array, error value', () => {
            const logical1 = new ArrayValueObject({
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
            const logical2 = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [false],
                    ['#NAME?'],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(logical1, logical2);
            expect(result.getValue()).toBe('#NAME?');
        });
    });
});
