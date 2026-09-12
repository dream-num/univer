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
import { BooleanValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Linest } from '../index';

describe('Test linest function', () => {
    const testFunction = new Linest(FUNCTION_NAMES_STATISTICAL.LINEST);

    describe('Linest', () => {
        it('Value is normal', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                    [4],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [5],
                    [6],
                    [7],
                    [8],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const stats = BooleanValueObject.create(true);
            const result = testFunction.calculate(knownYs, knownXs, constb, stats);
            expect(getObjectValue(result)).toStrictEqual([
                [1, -4],
                [0, 0],
                [1, 0],
                [ErrorType.NUM, 2],
                [5, 0],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [0.402298850575, 0],
                [0.0593560666085, ErrorType.NA],
                [0.938697318008, 0.782960292686],
                [45.9375, 3],
                [28.1609195402, 1.83908045977],
            ]);
        });

        it('Only knownYs value', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100],
                    [47300],
                    [69000],
                    [102000],
                    [150000],
                    [220000],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(knownYs);
            expect(getObjectValue(result, true)).toStrictEqual([
                [36445.7142857143, -23993.3333333333],
            ]);
        });

        it('KnownYs is one column, and knownXs is multiple columns', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [14200],
                    [14400],
                    [15100],
                    [150000],
                    [13900],
                    [16900],
                    [12600],
                    [14290],
                    [16300],
                    [16900],
                    [14900],
                ]),
                rowCount: 11,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2310, 2, 2, 20],
                    [2333, 2, 2, 1.2],
                    [2356, 3, 1.5, 33],
                    [2379, 3, 2, 43],
                    [2402, 2, 3, 53],
                    [2425, 4, 2, 23],
                    [2448, 2, 1.5, 99],
                    [2471, 2, 2, 34],
                    [2494, 3, 3, 23],
                    [2517, 4, 4, 55],
                    [2540, 2, 3, 22],
                ]),
                rowCount: 11,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const stats = BooleanValueObject.create(true);
            const result = testFunction.calculate(knownYs, knownXs, constb, stats);
            expect(getObjectValue(result, true)).toStrictEqual([
                [204.080843005, -3407.54648311873, 12743.5528364872, -127.712022706613, 303849.431233932],
                [651.098478042223, 27243.5182021205, 20457.1543147677, 281.254697108, 634296.647114014],
                [0.107464822024, 49689.6546787527, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [0.180606027654, 6, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [1783709761.98333, 14814370692.5621, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [104.931508746583, -10969.5506756927, 12875.3758749944, 6.2539663735, 0],
                [582.358051352254, 20946.2250961889, 19296.6787389021, 28.2242490263, ErrorType.NA],
                [0.378600130052, 46875.144599683, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [1.06622202487, 7, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [9371149831.31164, 15380954268.6884, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const stats2 = BooleanValueObject.create(false);
            const result3 = testFunction.calculate(knownYs, knownXs, constb, stats2);
            expect(getObjectValue(result3, true)).toStrictEqual([
                [204.080843005, -3407.54648311873, 12743.5528364872, -127.712022706613, 303849.431233932],
            ]);
        });

        it('KnownYs is one row, and knownXs is multiple rows', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2310, 2, 2, 20, 14200],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2333, 2, 2, 1.2, 14400],
                    [2356, 3, 1.5, 33, 15100],
                    [2379, 3, 2, 43, 150000],
                    [2402, 2, 3, 53, 13900],
                ]),
                rowCount: 4,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const stats = BooleanValueObject.create(true);
            const result = testFunction.calculate(knownYs, knownXs, constb, stats);
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.259519098763, 0.000629921769464, 0.172592784662, 0.548068059432, -0.134842435684],
                [0, 0, 0, 0, 0],
                [1, 0, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [ErrorType.NUM, 0, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [152301876.8, 2.64699020724e-23, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [0.254604259712, 0.000585979662783, 0.176345792867, 0.549325164445, 0],
                [0.0772515108466, 0.00105259093653, 0.127124989335, 0.0480042052851, ErrorType.NA],
                [0.999999999828, 0.188820411979, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [1451320007.4257, 1, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [206976507.964347, 0.03565314798, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('Keeps high-order polynomial coefficients stable', () => {
            const xValues = [155, 178, 195, 205, 189, 179, 142, 130, 152, 166, 194];
            const yValues = [
                975097,
                1076088.07,
                985880.56,
                1264998.15,
                1487692.02,
                879096.99,
                1013152.71,
                480886.67,
                651359.67,
                472135.74,
                720614.91,
            ];
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject(yValues.map((value) => [value])),
                rowCount: yValues.length,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject(
                    xValues.map((value) => Array.from({ length: 6 }, (_, index) => value ** (index + 1)))
                ),
                rowCount: xValues.length,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = getObjectValue(testFunction.calculate(knownYs, knownXs)) as number[][];
            const expected = [
                0.003030803284094725,
                -3.014286876228756,
                1242.0301184586228,
                -271378.1017228177,
                33159765.83632094,
                -2148345015.0620275,
                57656015344.78786,
            ];

            result[0].forEach((actual, index) => {
                const relativeError = Math.abs(actual - expected[index]) / Math.max(Math.abs(expected[index]), 1);
                expect(relativeError).toBeLessThan(1e-8);
            });
        });

        it('Stats value test', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                    [4],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [5],
                    [6],
                    [7],
                    [8],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const stats = BooleanValueObject.create(false);
            const result = testFunction.calculate(knownYs, knownXs, constb, stats);
            expect(getObjectValue(result)).toStrictEqual([
                [1, -4],
            ]);

            const stats2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(knownYs, knownXs, constb, stats2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const constb2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const stats3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(knownYs, knownXs, constb2, stats3);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('KnownXs length error', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2],
                    [3],
                    [4],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
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
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.REF);

            const knownXs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5],
                    [2, 3, 4, 5, 6],
                    [3, 4, 5, 6, 7],
                    [4, 5, 6, 7, 8],
                ]),
                rowCount: 4,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(knownYs, knownXs2);
            expect(getObjectValue(result2)).toBe(ErrorType.NA);

            const knownYs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4],
                    [2, 3, 4, 5],
                    [3, 4, 5, 6],
                    [4, 5, 6, 7],
                    [5, 6, 7, 8],
                ]),
                rowCount: 5,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(knownYs2, knownXs3);
            expect(getObjectValue(result3)).toBe(ErrorType.NA);
        });

        it('Value is error', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100, 47300, 69000, 102000, 150000, 220000],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 17, 18, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const knownYs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100, 47300, 69000, 102000, 150000, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 17, 18, 19],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(knownYs2, knownXs2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);
        });

        it('More test1', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [20, 14200],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const stats = BooleanValueObject.create(true);
            const result = testFunction.calculate(knownYs, knownXs, constb, stats);
            expect(getObjectValue(result)).toStrictEqual([
                [0, 2],
                [0, 0],
                [1, 0],
                [ErrorType.NUM, 0],
                [0, 0],
            ]);
        });
    });
});
