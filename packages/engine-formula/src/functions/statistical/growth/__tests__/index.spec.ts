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
            expect(getObjectValue(result, true)).toStrictEqual([
                [136608.337754885, 145970.018969851],
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
                [32618.2037735398],
                [47729.4226147478],
                [69841.3008562175],
                [102197.073378832],
                [149542.486740046],
                [218821.876214595],
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
                [1806822.19644322, 4216666.61245503],
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
                [14.7482895391],
                [217.512044329],
                [3207.93060800267],
                [47311.4894281406],
                [697763.544611935],
                [10290818.7857604],
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
                [14.7482895391],
                [217.512044329],
                [3207.93060800267],
                [47311.4894281406],
                [697763.544611935],
                [10290818.7857604],
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
            expect(getObjectValue(result, true)).toStrictEqual([
                [3.22370979547, 5.58362915461, 9.67112938641, 16.7508874638, 29.0133881592, 50.2526623915, 87.0401644777],
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
                [2.30765121861],
                [2.72774773318],
                [3.22432074476],
                [3.81129242219],
                [4.5051193964],
                [5.32525414676],
                [6.29469038053],
                [7.44060769584],
                [8.79513360255],
                [10.3962442651],
                [12.2888292212],
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
                [1.11612317403],
                [1.76172958987],
                [2.78077834063],
                [4.38928211468],
                [6.92820323028],
                [10.9357290659],
                [17.2613542398],
                [27.2459520893],
                [43.0060060724],
                [67.8822509939],
                [107.147824707257],
            ]);

            const result4 = testFunction.calculate(knownYs2, knownXs2, newXs3, constb2);
            expect(getObjectValue(result4, true)).toStrictEqual([
                [1.11612317403],
                [1.76172958987],
                [2.78077834063],
                [4.38928211468],
                [6.92820323028],
                [10.9357290659],
                [17.2613542398],
                [27.2459520893],
                [43.0060060724],
                [67.8822509939],
                [107.147824707258],
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
            expect(getObjectValue(result5, true)).toStrictEqual([
                [1.11612317403, 1.76172958987, 2.78077834063, 4.38928211468, 6.92820323028, 10.9357290659, 17.2613542398],
            ]);
        });
    });
});
