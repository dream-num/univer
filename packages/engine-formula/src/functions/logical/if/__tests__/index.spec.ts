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
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { If } from '../index';

describe('Test if function', () => {
    const testFunction = new If(FUNCTION_NAMES_LOGICAL.IF);

    describe('If', () => {
        it('LogicalTest and valueIfTrue', () => {
            const logicTest = BooleanValueObject.create(true);
            const valueIfTrue = NumberValueObject.create(1);
            const result = testFunction.calculate(logicTest, valueIfTrue);
            expect(getObjectValue(result)).toBe(1);
        });

        it('LogicalTest and valueIfTrue and valueIfFalse', () => {
            const logicTest = BooleanValueObject.create(false);
            const valueIfTrue = NumberValueObject.create(1);
            const valueIfFalse = NumberValueObject.create(2);
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toBe(2);
        });

        it('LogicalTest is array', () => {
            const logicTest = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false],
                    [true],
                    [true],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfTrue = NumberValueObject.create(1);
            const result = testFunction.calculate(logicTest, valueIfTrue);
            expect(getObjectValue(result)).toStrictEqual([
                [false],
                [1],
                [1],
            ]);
        });

        it('ValueIfTrue is array', () => {
            const logicTest = BooleanValueObject.create(true);
            const valueIfTrue = ArrayValueObject.create({
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
            const result = testFunction.calculate(logicTest, valueIfTrue);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [2],
                [3],
            ]);
        });
        it('ValueIfTrue is array, set false', () => {
            const logicTest = BooleanValueObject.create(false);
            const valueIfTrue = ArrayValueObject.create({
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
            const result = testFunction.calculate(logicTest, valueIfTrue);
            expect(getObjectValue(result)).toBe(false);
        });

        it('ValueIfFalse is array', () => {
            const logicTest = BooleanValueObject.create(false);
            const valueIfTrue = NumberValueObject.create(1);
            const valueIfFalse = ArrayValueObject.create({
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
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [2],
                [3],
            ]);
        });

        it('LogicalTest is array and valueIfTrue is array', () => {
            const logicTest = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [false],
                    [1],
                    [0],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfTrue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                    [4],
                    [5],
                ]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(logicTest, valueIfTrue);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [false],
                [3],
                [false],
                ['#N/A'],
            ]);
        });

        it('LogicalTest is array and valueIfFalse is array', () => {
            const logicTest = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [false],
                    [1],
                    [0],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfTrue = StringValueObject.create('yes');

            const valueIfFalse = ArrayValueObject.create({
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
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                ['yes'],
                [2],
                ['yes'],
                ['#N/A'],
            ]);
        });

        it('ValueIfTrue is array and valueIfFalse is array', () => {
            const logicTest = BooleanValueObject.create(true);

            const valueIfTrue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                    [4],
                    [5],
                ]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfFalse = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [6],
                    [7],
                    [8],
                    [9],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [2],
                [3],
                [4],
                [5],
            ]);
        });

        it('LogicalTest is array and valueIfTrue is array and valueIfFalse is array', () => {
            const logicTest = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [false],
                    [1],
                    [0],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfTrue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                    [4],
                    [5],
                ]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfFalse = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [6],
                    [7],
                    [8],
                    [9],
                    [10],
                ]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [7],
                [3],
                [9],
                ['#N/A'],
            ]);
        });

        it('LogicalTest is 3*2 array and 1*4 valueIfTrue is array and 1*3 valueIfFalse is array', () => {
            const logicTest = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false, true],
                    [true, true],
                    [false, true],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfTrue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['yes1', 'yes2', 'yes3', 'yes4'],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfFalse = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['no1', 'no2', 'no3'],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                ['no1', 'yes2', '#N/A', '#N/A'],
                ['yes1', 'yes2', '#N/A', '#N/A'],
                ['no1', 'yes2', '#N/A', '#N/A'],
            ]);
        });

        it('LogicalTest is 2*1 array and 3*4 valueIfTrue is array and 4*3 valueIfFalse is array', () => {
            const logicTest = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false],
                    [true],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfTrue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['yes1', 'yes2', 'yes3', 'yes4'],
                    ['yes2', 'yes3', 'yes4', 'yes5'],
                    ['yes3', 'yes4', 'yes5', 'yes6'],
                ]),
                rowCount: 3,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfFalse = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['no1', 'no2', 'no3'],
                    ['no2', 'no3', 'no4'],
                    ['no3', 'no4', 'no5'],
                    ['no4', 'no5', 'no6'],
                ]),
                rowCount: 4,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                ['no1', 'no2', 'no3', '#N/A'],
                ['yes2', 'yes3', 'yes4', 'yes5'],
                ['#N/A', '#N/A', '#N/A', '#N/A'],
                ['#N/A', '#N/A', '#N/A', '#N/A'],
            ]);
        });

        it('LogicalTest is 1*2 array and 3*4 valueIfTrue is array and 4*3 valueIfFalse is array', () => {
            const logicTest = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [false, true],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfTrue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['yes1', 'yes2', 'yes3', 'yes4'],
                    ['yes2', 'yes3', 'yes4', 'yes5'],
                    ['yes3', 'yes4', 'yes5', 'yes6'],
                ]),
                rowCount: 3,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfFalse = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['no1', 'no2', 'no3'],
                    ['no2', 'no3', 'no4'],
                    ['no3', 'no4', 'no5'],
                    ['no4', 'no5', 'no6'],
                ]),
                rowCount: 4,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                ['no1', 'yes2', '#N/A', '#N/A'],
                ['no2', 'yes3', '#N/A', '#N/A'],
                ['no3', 'yes4', '#N/A', '#N/A'],
                ['no4', '#N/A', '#N/A', '#N/A'],
            ]);
        });

        it('LogicalTest is 3*1 array and 1*4 valueIfTrue is array and 1*3 valueIfFalse is array', () => {
            const logicTest = ArrayValueObject.create({
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

            const valueIfTrue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['yes1', 'yes2', 'yes3', 'yes4'],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const valueIfFalse = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['no1', 'no2', 'no3'],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(logicTest, valueIfTrue, valueIfFalse);
            expect(getObjectValue(result)).toStrictEqual([
                ['no1', 'no2', 'no3', '#N/A'],
                ['yes1', 'yes2', 'yes3', 'yes4'],
                ['no1', 'no2', 'no3', '#N/A'],
            ]);
        });
    });
});
