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
import { getObjectValue } from '../../../../functions/util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Logest } from '../index';

describe('Test logest function', () => {
    const testFunction = new Logest(FUNCTION_NAMES_STATISTICAL.LOGEST);

    describe('Logest', () => {
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
            expect(getObjectValue(result, true)).toStrictEqual([
                [1.57843653, 0.113913844437],
                [0.0652255874703, 0.430192295197],
                [0.960760488308, 0.145848847456],
                [48.9690338576, 2],
                [1.04166372065, 0.0425437726085],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [1.14092158622, 1],
                [0.0334753021557, ErrorType.NA],
                [0.837928415694, 0.441569562661],
                [15.5103391989, 3],
                [3.0242629944, 0.584951036006],
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
                [1.46327562812, 22291.2232984654],
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
                [1.00225626311, 0.955992743217, 1.32201735202, 0.997967326319, 1251594.75697854],
                [0.0111189448553, 0.465243257003, 0.349351101858, 0.00480304527334, 10.8320164753],
                [0.123427911828, 0.848560623139, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [0.211211228649, 6, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [0.608334915774, 4.32033078685, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [0.997675048746, 0.67406990963, 1.33009450491, 1.00416405143, 1],
                [0.0110423660294, 0.397171265872, 0.365893438396, 0.000535173314646, ErrorType.NA],
                [0.994809235519, 0.888821753471, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [335.387237981475, 7, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [1059.82918504031, 5.5300287661, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const stats2 = BooleanValueObject.create(false);
            const result3 = testFunction.calculate(knownYs, knownXs, constb, stats2);
            expect(getObjectValue(result3, true)).toStrictEqual([
                [1.00225626311, 0.955992743217, 1.32201735202, 0.997967326319, 1251594.75697854],
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
                [1.03240326243, 0.999873102005, 1.02157358567, 0.950065530365, 1.95065522079],
                [0, 0, 0, 0, 0],
                [1, 0, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [ErrorType.NUM, 0, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [67.2589543311, 0, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [1.05785486342, 1.00009083808, 1.00275120551, 0.944165822215, 1],
                [0.382793300408, 0.00521575247085, 0.629924174927, 0.237868333877, ErrorType.NA],
                [0.994573882203, 0.935634628939, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [45.8234560762, 1, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [160.457642442172, 0.875412158869, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
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
            expect(getObjectValue(result, true)).toStrictEqual([
                [1.57843653, 0.113913844437],
            ]);

            const stats2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(knownYs, knownXs, constb, stats2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

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
    });
});
