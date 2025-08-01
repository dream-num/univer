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
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { And } from '../index';

describe('Test and function', () => {
    const testFunction = new And(FUNCTION_NAMES_LOGICAL.AND);

    describe('And', () => {
        it('logical1 string', () => {
            const logical1 = StringValueObject.create('a1');
            const result = testFunction.calculate(logical1);
            expect(result.getValue()).toBe('#VALUE!');
        });
        it('logical1 number 1', () => {
            const logical1 = NumberValueObject.create(1);
            const result = testFunction.calculate(logical1);
            expect(result.getValue()).toBe(true);
        });

        it('logical1 number 0', () => {
            const logical1 = NumberValueObject.create(0);
            const result = testFunction.calculate(logical1);
            expect(result.getValue()).toBe(false);
        });

        it('logical1 null', () => {
            const logical1 = NullValueObject.create();
            const result = testFunction.calculate(logical1);
            expect(result.getValue()).toBe('#VALUE!');
        });

        it('logical1 true', () => {
            const logical1 = BooleanValueObject.create(true);
            const result = testFunction.calculate(logical1);
            expect(result.getValue()).toBe(true);
        });

        it('logical2 false', () => {
            const logical1 = BooleanValueObject.create(true);
            const logical2 = BooleanValueObject.create(false);
            const result = testFunction.calculate(logical1, logical2);
            expect(result.getValue()).toBe(false);
        });

        it('logical1 is array, no logical value', () => {
            const logical1 = ArrayValueObject.create({
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
            const result = testFunction.calculate(logical1);
            expect(result.getValue()).toBe('#VALUE!');
        });

        it('logical1 is array and logical2 is array', () => {
            const logical1 = ArrayValueObject.create({
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
            const logical2 = ArrayValueObject.create({
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
            const result = testFunction.calculate(logical1, logical2);
            expect(result.getValue()).toBe(true);
        });

        it('logical1 is array and logical2 is array, error value', () => {
            const logical1 = ArrayValueObject.create({
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
            const logical2 = ArrayValueObject.create({
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
            const result = testFunction.calculate(logical1, logical2);
            expect(result.getValue()).toBe('#NAME?');
        });
    });
});
