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
import { BooleanValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Trend } from '../index';

describe('Test trend function', () => {
    const testFunction = new Trend(FUNCTION_NAMES_STATISTICAL.TREND);

    describe('Trend', () => {
        it('Value is normal', () => {
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
                    [11, 1.2, 1.3, 14, 15, 16],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [17, 18],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const result = testFunction.calculate(knownYs, knownXs, newXs, constb);
            expect(getObjectValue(result, true)).toStrictEqual([
                [155404.535835265, 162554.586755072],
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
            const actual = getObjectValue(result) as number[][];
            // Independent 100-digit least-squares reference.
            const expected = [12452.380952380952, 48898.09523809524, 85343.80952380953, 121789.52380952382, 158235.2380952381, 194680.95238095237];
            expect(actual.map((row) => row.length)).toEqual(new Array(expected.length).fill(1));
            for (let i = 0; i < expected.length; i++) expect(Math.abs(actual[i][0] / expected[i] - 1)).toBeLessThan(1e-12);

            const knownYs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME],
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
            const result2 = testFunction.calculate(knownYs2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const knownYs3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
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
            const result3 = testFunction.calculate(knownYs3);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);

            const knownYs4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
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
            const result4 = testFunction.calculate(knownYs4);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const knownYs5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test'],
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
            const result5 = testFunction.calculate(knownYs5);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);
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

        it('NewXs length error', () => {
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
                    [1, 2],
                    [2, 3],
                    [3, 4],
                    [4, 5],
                ]),
                rowCount: 4,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [2, 3, 4],
                    [3, 4, 5],
                    [4, 5, 6],
                ]),
                rowCount: 4,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(knownYs, knownXs, newXs);
            expect(getObjectValue(result)).toBe(ErrorType.REF);
        });

        it('Constb value test', () => {
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
                    [11, 1.2, 1.3, 14, 15, 16],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [17, 18],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(false);
            const result = testFunction.calculate(knownYs, knownXs, newXs, constb);
            expect(getObjectValue(result, true)).toStrictEqual([
                [163575.849113128, 173197.957884488],
            ]);

            const knownYs2 = ArrayValueObject.create({
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
            const result2 = testFunction.calculate(knownYs2, undefined, undefined, constb);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [30908.7912087912],
                [61817.5824175824],
                [92726.3736263736],
                [123635.164835165],
                [154543.956043956],
                [185452.747252747],
            ]);

            const constb2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test', 1],
                    [2, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(knownYs2, undefined, undefined, constb2);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);

            const result4 = testFunction.calculate(knownYs2, undefined, undefined, constb);
            expect(getObjectValue(result4, true)).toStrictEqual([
                [30908.7912087912],
                [61817.5824175824],
                [92726.3736263736],
                [123635.164835165],
                [154543.956043956],
                [185452.747252747],
            ]);
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
            const knownXs = ErrorValueObject.create(ErrorType.NAME);
            const newXs = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toBe(ErrorType.REF);

            const result2 = testFunction.calculate(knownYs, undefined, newXs);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const knownXs2 = ArrayValueObject.create({
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
            const result3 = testFunction.calculate(knownYs, knownXs2);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);
        });

        it('More test', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [2, 3],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 4],
                    [4, 5],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [5, 6, 7, 8, 9, 10, 11],
                ]),
                rowCount: 1,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const result = testFunction.calculate(knownYs, knownXs, newXs, constb);
            expect(getObjectValue(result)).toStrictEqual([
                [3, 4, 5, 6, 7, 8, 9],
            ]);

            const newXs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [5],
                    [6],
                    [7],
                    [8],
                    [9],
                    [10],
                    [11],
                    [12],
                    [13],
                    [14],
                    [15],
                ]),
                rowCount: 11,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, newXs2, constb2);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [2.57575757576],
                [3.09090909091],
                [3.60606060606],
                [4.12121212121],
                [4.63636363636],
                [5.15151515152],
                [5.66666666667],
                [6.18181818182],
                [6.69696969697],
                [7.21212121212],
                [7.72727272727],
            ]);

            const knownYs2 = ArrayValueObject.create({
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
            const knownXs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [2, 3],
                    [3, 4],
                    [4, 5],
                ]),
                rowCount: 4,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [2, 3],
                    [3, 4],
                    [4, 5],
                    [5, 6],
                    [6, 7],
                    [7, 8],
                    [8, 9],
                    [9, 10],
                    [10, 11],
                    [11, 12],
                ]),
                rowCount: 11,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(knownYs2, knownXs2, newXs3, constb);
            expect(getObjectValue(result3, true)).toStrictEqual([
                [1],
                [2],
                [3],
                [4],
                [5],
                [6],
                [7],
                [8],
                [9],
                [10],
                [11],
            ]);

            const result4 = testFunction.calculate(knownYs2, knownXs2, newXs3, constb2);
            expect(getObjectValue(result4)).toStrictEqual(
                Array.from({ length: 11 }, (_, index) => [expect.closeTo(index + 1, 11)])
            );

            const knownYs3 = ArrayValueObject.create({
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
                ]),
                rowCount: 2,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5, 6, 7],
                    [2, 3, 4, 5, 6, 7, 8],
                ]),
                rowCount: 2,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result5 = testFunction.calculate(knownYs3, knownXs3, newXs4, constb);
            expect(getObjectValue(result5, true)).toStrictEqual([
                [1, 2, 3, 4, 5, 6, 7],
            ]);

            const knownYs4 = NumberValueObject.create(1);
            const knownXs4 = NumberValueObject.create(1);
            const newXs5 = NumberValueObject.create(2);
            const result6 = testFunction.calculate(knownYs4, knownXs4, newXs5);
            expect(getObjectValue(result6)).toBe(ErrorType.NA);
        });
    });
});

function regressionArray(values: number[], column: boolean) {
    return ArrayValueObject.createByArray(column ? values.map((value) => [value]) : [values]);
}

describe('TREND single-predictor stability', () => {
    const trend = new Trend(FUNCTION_NAMES_STATISTICAL.TREND);

    it('predicts around adjacent translated predictors without reconstructing their mean', () => {
        for (const xOffset of [0, 2 ** 52, -(2 ** 52)]) {
            for (const yOffset of [0, 2 ** 52]) {
                for (const column of [false, true]) {
                    const xs = regressionArray([xOffset, xOffset + 1], column);
                    const ys = regressionArray([yOffset + 1, yOffset + 3], column);
                    const newXs = regressionArray([-1, 0, 1, 2].map((value) => value + xOffset), column);
                    const expected = [-1, 1, 3, 5].map((value) => value + yOffset);
                    expect(getObjectValue(trend.calculate(ys, xs, newXs))).toEqual(column ? expected.map((value) => [value]) : [expected]);
                    expect(getObjectValue(trend.calculate(ys, xs))).toEqual(getObjectValue(ys));
                }
            }
        }
    });

    it('preserves non-exact fits when only the predictor origin changes', () => {
        for (const offset of [0, 2 ** 52, -(2 ** 52)]) {
            const xs = regressionArray([0, 1, 2, 4].map((value) => value + offset), false);
            const ys = regressionArray([1, 3, 4, 8], false);
            const newXs = regressionArray([-1, 0, 1, 2, 3, 4, 5].map((value) => value + offset), false);
            const result = getObjectValue(trend.calculate(ys, xs, newXs)) as number[][];
            for (let index = 0; index < result[0].length; index++) {
                expect(result[0][index]).toBeCloseTo(1 + 12 / 7 * (index - 1), 13);
            }
        }
    });

    it('retains zero-slope predictions far from large known predictors', () => {
        const xs = regressionArray([Number.MAX_VALUE, Number.MAX_VALUE - 2 ** 971], false);
        const ys = regressionArray([2, 2], false);
        expect(getObjectValue(trend.calculate(ys, xs, NumberValueObject.create(-Number.MAX_VALUE)))).toEqual([[2]]);
    });

    it('retains finite predictions when anchored coefficients need an overflow fallback', () => {
        const cases = [
            { x: [1e308, -1e307, -1e307], y: [2, 2, 2], expected: 2 },
            { x: [1, 2, 3], y: [1e308, -1e307, -1e307], expected: 1.3666666666666667e308 },
            { x: [2, 3, 4], y: [1e308, 4e307, 2e307], expected: 1.7333333333333333e308 },
        ];
        for (const { x, y, expected } of cases) {
            for (const column of [false, true]) {
                const result = getObjectValue(trend.calculate(regressionArray(y, column), regressionArray(x, column), NumberValueObject.create(0))) as number[][];
                expect(Math.abs(result[0][0] / expected - 1)).toBeLessThan(1e-14);
            }
        }
    });

    it('predicts new values with translated row and column input arrays', () => {
        const offset = 1e9;
        for (const column of [false, true]) {
            const xs = regressionArray([offset, offset + 1, offset + 2, offset + 3], column);
            const ys = regressionArray([7, 9, 11, 13], column);
            const newXs = regressionArray([offset - 1, offset + 4], column);
            expect(getObjectValue(trend.calculate(ys, xs, newXs))).toEqual(column ? [[5], [15]] : [[5, 15]]);
        }
    });

    it('returns the constant response for a rounded constant predictor mean', () => {
        for (const column of [false, true]) {
            const values = regressionArray([0.1, 0.1, 0.1], column);
            expect(getObjectValue(trend.calculate(values, values, NumberValueObject.create(1)))).toEqual([[0.1]]);
        }
    });

    it.each([false, true])('predicts from adjacent predictors whose mean is not representable (column=%s)', (column) => {
        const offset = 2 ** 52;
        const xs = regressionArray([offset, offset + 1], column);
        const ys = regressionArray([1, 3], column);
        const newXs = regressionArray([offset, offset + 1, offset + 2], column);
        expect(getObjectValue(trend.calculate(ys, xs, newXs))).toEqual(column ? [[1], [3], [5]] : [[1, 3, 5]]);
    });

    it('predicts the response mean independently of new predictors', () => {
        for (const x of [0, 0.1, -0.1, 2 ** 40, Number.MAX_VALUE]) {
            for (const column of [false, true]) {
                const xs = regressionArray([x, x, x], column);
                const ys = regressionArray([1, 2, 3], column);
                const newXs = regressionArray([-1, 0, 1], column);
                expect(getObjectValue(trend.calculate(ys, xs, newXs))).toEqual(column ? [[2], [2], [2]] : [[2, 2, 2]]);
            }
        }
    });

    it('retains the fit through the origin when an intercept is disabled', () => {
        const xs = regressionArray([0.1, 0.1, 0.1], false);
        const ys = regressionArray([0.2, 0.2, 0.2], false);
        const newXs = regressionArray([0, 1, 2], false);
        expect(getObjectValue(trend.calculate(ys, xs, newXs, BooleanValueObject.create(false)), true)).toEqual([[0, 2, 4]]);
    });
});
