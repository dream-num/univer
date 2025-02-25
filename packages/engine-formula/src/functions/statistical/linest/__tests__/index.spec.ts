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
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
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
            expect(getObjectValue(result2)).toStrictEqual([
                [0.4022988505747127, 0],
                [0.05935606660854279, ErrorType.NA],
                [0.9386973180076628, 0.7829602926862714],
                [45.937499999999986, 3],
                [28.160919540229884, 1.8390804597701154],
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
            expect(getObjectValue(result)).toStrictEqual([
                [36445.71428571428, -23993.33333333333],
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
            expect(getObjectValue(result)).toStrictEqual([
                [204.08084300495466, -3407.546483120881, 12743.55283648931, -127.71202270661888, 303849.43123394996],
                [651.0984780422234, 27243.518202120504, 20457.15431476776, 281.25469710804725, 634296.6471140139],
                [0.10746482202373192, 49689.654678752704, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [0.18060602765382994, 6, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [1783709761.9833107, 14814370692.562143, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2)).toStrictEqual([
                [104.93150874658363, -10969.550675692437, 12875.375874994475, 6.253966373496326, 0],
                [582.3580513522538, 20946.225096188875, 19296.67873890206, 28.224249026281957, ErrorType.NA],
                [0.3786001300516361, 46875.144599683044, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [1.066222024870103, 7, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [9371149831.311636, 15380954268.688364, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const stats2 = BooleanValueObject.create(false);
            const result3 = testFunction.calculate(knownYs, knownXs, constb, stats2);
            expect(getObjectValue(result3)).toStrictEqual([
                [204.08084300495466, -3407.546483120881, 12743.55283648931, -127.71202270661888, 303849.43123394996],
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
            expect(getObjectValue(result)).toStrictEqual([
                [0.2595190981297719, 0.0006299216330276636, 0.17259280062947369, 0.5480680786089209, -0.13484243565471843],
                [0, 0, 0, 0, 0],
                [0.9999999999999984, 0, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [ErrorType.NUM, 0, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [152301876.79999977, 2.446228251051695e-7, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs, knownXs, constb2, stats);
            expect(getObjectValue(result2)).toStrictEqual([
                [0.2546042576432228, 0.0005859795492142439, 0.17634578794240952, 0.5493251606822014, 0],
                [0.07725154448946374, 0.001052591394934137, 0.12712504469774474, 0.048004226190790644, ErrorType.NA],
                [0.9999999998277429, 0.18882049421003608, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [1451318743.3340783, 1, ErrorType.NA, ErrorType.NA, ErrorType.NA],
                [206976507.96434683, 0.03565317903372227, ErrorType.NA, ErrorType.NA, ErrorType.NA],
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
            expect(getObjectValue(result)).toStrictEqual([
                [1, -4],
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
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);
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
            expect(getObjectValue(result)).toStrictEqual(ErrorType.REF);

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
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NA);

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
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NA);
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
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

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
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);
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
