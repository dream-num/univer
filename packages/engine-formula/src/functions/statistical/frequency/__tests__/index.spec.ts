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
import { NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Frequency } from '../index';

describe('Test frequency function', () => {
    const testFunction = new Frequency(FUNCTION_NAMES_STATISTICAL.FREQUENCY);

    describe('Frequency', () => {
        it('Keeps unsorted duplicate bins in their original output positions', () => {
            const data = ArrayValueObject.createByArray([[-5, 0, 0, 1, 3, 3, 4, 6, 8, 9, 10]]);
            const bins = ArrayValueObject.createByArray([[6, 0, 6, 3]]);
            expect(getObjectValue(testFunction.calculate(data, bins))).toStrictEqual([[2], [3], [0], [3], [3]]);
        });

        it('Matches bucket counts across different bin orders, duplicates and boundaries', () => {
            for (let seed = 0; seed < 64; seed++) {
                const dataValues = Array.from({ length: 31 }, (_, i) => (i * 7 + seed) % 29 - 14);
                const binValues = Array.from({ length: 13 }, (_, i) => (i * (seed + 3) + seed) % 23 - 11);
                const boundaries = [...new Set(binValues)].sort((a, b) => a - b);
                const expected = Array.from({ length: binValues.length + 1 }, () => [0]);
                for (const value of dataValues) {
                    const upperBound = boundaries.find((bound) => value <= bound);
                    const index = upperBound === undefined ? binValues.length : binValues.indexOf(upperBound);
                    expected[index][0]++;
                }
                const data = ArrayValueObject.createByArray([dataValues]);
                const bins = ArrayValueObject.createByArray([binValues]);
                expect(getObjectValue(testFunction.calculate(data, bins))).toStrictEqual(expected);
            }
        });

        it('Counts a large data array against descending bins', () => {
            const data = ArrayValueObject.createByArray([Array.from({ length: 8192 }, (_, i) => i)]);
            const bins = ArrayValueObject.createByArray([Array.from({ length: 4096 }, (_, i) => (4095 - i) * 2 + 1)]);
            const expected = [...Array.from({ length: 4096 }, () => [2]), [0]];
            expect(getObjectValue(testFunction.calculate(data, bins))).toStrictEqual(expected);
        });

        it('Retains existing NaN, infinite endpoint and numeric error handling', () => {
            const zero = NumberValueObject.create(0);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(Number.NaN), zero))).toStrictEqual([[0], [0]]);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(-Infinity), zero))).toStrictEqual([[0], [0]]);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(Infinity), zero))).toStrictEqual([[0], [1]]);
            expect(getObjectValue(testFunction.calculate(zero, NumberValueObject.create(Infinity)))).toStrictEqual([[1], [0]]);
            expect(getObjectValue(testFunction.calculate(zero, NumberValueObject.create(-Infinity)))).toStrictEqual([[0], [1]]);
            expect(getObjectValue(testFunction.calculate(zero, NumberValueObject.create(Number.NaN)))).toStrictEqual([[1], [0]]);
            for (const value of [Number.NaN, -Infinity, Infinity]) {
                const data = ArrayValueObject.createByArray([[value]]);
                expect(getObjectValue(testFunction.calculate(data, zero))).toBe(ErrorType.NUM);
            }
        });

        it('Ignores holes converted to blank array cells', () => {
            const dataValues = new Array<number | null>(7);
            dataValues[1] = -1;
            dataValues[5] = 3;
            const binValues = new Array<number | null>(6);
            binValues[2] = 0;
            binValues[4] = 4;
            const data = ArrayValueObject.createByArray([dataValues]);
            const bins = ArrayValueObject.createByArray([binValues]);
            expect(getObjectValue(testFunction.calculate(data, bins))).toStrictEqual([[1], [1], [0]]);
        });

        it('Value is normal', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [70],
                    [79],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [2],
                [4],
                [2],
            ]);
        });

        it('BinsArray value order test', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [70],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [2],
                [1],
                [4],
                [2],
            ]);

            const binsArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [89],
                    [79],
                    [70],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(dataArray, binsArray2);
            expect(getObjectValue(result2)).toStrictEqual([
                [4],
                [2],
                [1],
                [2],
            ]);

            const binsArray3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [79],
                    [79],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(dataArray, binsArray3);
            expect(getObjectValue(result3)).toStrictEqual([
                [3],
                [0],
                [0],
                [6],
            ]);
        });

        it('Value is error', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [0],
                [9],
            ]);

            const dataArray2 = ErrorValueObject.create(ErrorType.NAME);
            const binsArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [70],
                    [79],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(dataArray2, binsArray2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is null', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = NullValueObject.create();
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const dataArray2 = NullValueObject.create();
            const binsArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [70],
                    [79],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(dataArray2, binsArray2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const dataArray3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    [null],
                    [null],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(dataArray3, binsArray3);
            expect(getObjectValue(result3)).toStrictEqual([
                [0],
                [0],
            ]);
        });

        it('Value ignore string/boolean/blank cell', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [true],
                    [85],
                    [false],
                    [81],
                    ['test'],
                    [88],
                    [null],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [false],
                    [null],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [0],
                [5],
            ]);
        });
    });
});
