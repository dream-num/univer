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
import { BooleanValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Growth } from '../index';

describe('Test growth function', () => {
    const testFunction = new Growth(FUNCTION_NAMES_STATISTICAL.GROWTH);

    describe('Growth', () => {
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
            expect(getObjectValue(result)).toStrictEqual([
                [136608.33775488546, 145970.01896985146],
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
                [32618.2037735398],
                [47729.42261474784],
                [69841.30085621751],
                [102197.07337883243],
                [149542.48674004586],
                [218821.87621459534],
            ]);

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
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

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
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

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
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

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
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
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
            expect(getObjectValue(result)).toStrictEqual(ErrorType.REF);
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
            expect(getObjectValue(result)).toStrictEqual([
                [1806822.1964432173, 4216666.612455025],
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
            expect(getObjectValue(result2)).toStrictEqual([
                [14.748289539092573],
                [217.51204432890742],
                [3207.9306080026654],
                [47311.48942814059],
                [697763.5446119347],
                [10290818.78576035],
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
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const result4 = testFunction.calculate(knownYs2, undefined, undefined, constb);
            expect(getObjectValue(result4)).toStrictEqual([
                [14.748289539092573],
                [217.51204432890742],
                [3207.9306080026654],
                [47311.48942814059],
                [697763.5446119347],
                [10290818.78576035],
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
            expect(getObjectValue(result)).toStrictEqual(ErrorType.REF);

            const result2 = testFunction.calculate(knownYs, undefined, newXs);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

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
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);
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
                [3.2237097954706266, 5.583629154612603, 9.671129386411891, 16.750887463837827, 29.013388159235713, 50.252662391513546, 87.04016447770724],
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
            expect(getObjectValue(result2)).toStrictEqual([
                [2.307651218612649],
                [2.727747733175308],
                [3.224320744759815],
                [3.8112924221868782],
                [4.505119396395902],
                [5.325254146764445],
                [6.294690380529891],
                [7.440607695843031],
                [8.795133602548706],
                [10.396244265088487],
                [12.288829221203034],
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
            expect(getObjectValue(result3)).toStrictEqual([
                [1.1161231740339035],
                [1.7617295898720453],
                [2.780778340631825],
                [4.38928211467954],
                [6.92820323027555],
                [10.935729065914696],
                [17.261354239796905],
                [27.245952089325364],
                [43.00600607235713],
                [67.88225099390954],
                [107.14782470725653],
            ]);

            const result4 = testFunction.calculate(knownYs2, knownXs2, newXs3, constb2);
            expect(getObjectValue(result4)).toStrictEqual([
                [1.1161231740339097],
                [1.761729589872056],
                [2.7807783406318434],
                [4.38928211467957],
                [6.928203230275601],
                [10.935729065914781],
                [17.261354239797047],
                [27.2459520893256],
                [43.00600607235752],
                [67.88225099391019],
                [107.14782470725761],
            ]);

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
            expect(getObjectValue(result5)).toStrictEqual([
                [1.1161231740339035, 1.7617295898720453, 2.780778340631825, 4.38928211467954, 6.92820323027555, 10.935729065914696, 17.261354239796905],
            ]);
        });
    });
});
